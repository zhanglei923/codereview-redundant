const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

console.log(`numCPUs ${numCPUs}`);

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  console.log(`Worker ${process.pid} started`);
  setInterval(()=>{
      console.log(process.pid+':'+Math.random())
    }, 1000)
}