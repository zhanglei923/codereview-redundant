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

  for (let i = 0; i < numCPUs; i++) {
    let worker = cluster.fork();
    worker.on('message', function(message) {
      //console.log(`(master).${process.pid} got: '${JSON.stringify(message)}' from w.${worker.process.pid}`);
      if(message === MSG_REQUEST_TASKID){
        if(taskStack.length > 0){
          let taskid = taskStack.shift();
          worker.send({taskid})
        }else{
          worker.kill()
        }
      }      
    });
  }

} else {
  let worker = cluster.worker;
  console.log(`w.${process.pid} started`);
  process.on('message', function(message) {});
  worker.on('message', function(message) {
    if(message.taskid){
      console.log('multiTaskUtil', multiTaskUtil.ctxPath)
        console.log(`w.${process.pid} recevies '${message.taskid}'`);
        let taskinfo = multiTaskUtil.loadTask(message.taskid)
        if(taskinfo){
            compare.runCompare(taskinfo);
        }else{
            console.log('Can not find:', message.taskid)
        }
    }
  });
  worker.send(MSG_REQUEST_TASKID);

}