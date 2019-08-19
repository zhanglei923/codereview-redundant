var fs = require('fs');
var _ = require('lodash');
var md5Util = require("blueimp-md5")//https://github.com/blueimp/JavaScript-MD5
let multiTaskUtil = require('../util/multiTaskUtil')

let fpathCount = 0;
let fpathMap = {};

let compare = require('./compare')

const thisUtil = {
    run: () =>{
        thisUtil.runMultiTasks();
    },
    runMultiTasks: () =>{
        multiTaskUtil.beforePopTask();//get ready
        for(let i=0;i<Math.pow(10, 9);i++){
            let taskinfo = multiTaskUtil.popTask()
            if(taskinfo){
                compare.runCompare(taskinfo);
            }else{
                console.log('finished!')
                break;
            }
        }
    }
}
module.exports = thisUtil;