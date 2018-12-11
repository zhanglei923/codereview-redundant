var fs = require('fs');
var pathutil = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const multiTaskUtil = require('./util/multiTaskUtil')
let compare = require('./codereview/compare')

let MSG_REQUEST_TASKID = 'request_taskid';


let tmp_info = fs.readFileSync(pathutil.resolve(__dirname, './.tmp_info'), 'utf8');
tmp_info = JSON.parse(tmp_info);
let taskId = tmp_info.taskId;
let tasksPath = tmp_info.tasksPath;

multiTaskUtil.init(tasksPath, taskId);
multiTaskUtil.initTaskFolder();
multiTaskUtil.loadFileMap();

if (cluster.isMaster) {
  console.log(`numCPUs ${numCPUs}`);
  console.log(`Master=${process.pid}`);

  let tasks = multiTaskUtil.beforePopTask();//get ready
  console.log( 'tasks=', tasks);
  taskStack = tasks;
  let totalTaskNum = taskStack.length; 

  for (let i = 0; i < numCPUs; i++) {
    let worker = cluster.fork();
    worker.on('message', function(message) {
      //console.log(`(master).${process.pid} got: '${JSON.stringify(message)}' from w.${worker.process.pid}`);
      if(message === MSG_REQUEST_TASKID){
        if(taskStack.length > 0){
          let currentTaskNum = taskStack.length;          
          let taskid = taskStack.shift();
          worker.send({
            taskid,
            currentTaskNum,
            totalTaskNum
          })
        }else{
          worker.kill()
        }
      }      
    });
  }

} else {
  let worker = cluster.worker;
  console.log(`>[w]=${process.pid} started`);
  process.on('message', function(message) {});
  worker.on('message', function(message) {
      if(message.taskid){
          //console.log('multiTaskUtil', multiTaskUtil.ctxPath)
          //console.log(`w.${process.pid} recevies '${message.taskid}'`);
          console.log('run-task', `${message.currentTaskNum}/${message.totalTaskNum}`, `worker=${process.pid}`)
          let taskinfo = multiTaskUtil.loadTask(message.taskid)
          if(taskinfo){
              let displayInfo = {
                currentTaskNum: message.currentTaskNum,
                totalTaskNum: message.totalTaskNum,
                workerId: process.pid
              }
              compare.runCompare(taskinfo, displayInfo);
              worker.send(MSG_REQUEST_TASKID);//向master线程发消息，申请任务
          }else{
              console.log('Can not find:', message.taskid)
          }
      }
  });
  worker.send(MSG_REQUEST_TASKID);//向master线程发消息，申请任务

}