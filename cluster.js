const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

let MSG_REQUEST_TASKID = 'request_taskid';

if (cluster.isMaster) {
  console.log(`numCPUs ${numCPUs}`);
  console.log(`Master=${process.pid}`);
  taskStack = []
  for (let i = 0; i < 50; i++) taskStack.push(i)

  for (let i = 0; i < 2; i++) {
    let worker = cluster.fork();
    worker.on('message', function(message) {
      console.log(`(master).${process.pid} got: '${JSON.stringify(message)}' from w.${worker.process.pid}`);
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
    if(message.taskid)console.log(`w.${process.pid} recevies '${message.taskid}'`);
  });
  setInterval(()=>{
    worker.send(MSG_REQUEST_TASKID);
  }, 100)

}