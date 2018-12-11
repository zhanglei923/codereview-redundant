var fs = require('fs');
var _ = require('lodash');
var md5Util = require("blueimp-md5")//https://github.com/blueimp/JavaScript-MD5
var pathutil = require('path');
var jsdiff = require('diff');
let fileUtil = require('../util/fileUtil')
let scriptUtil = require('../util/scriptUtil')
let multiTaskUtil = require('../util/multiTaskUtil')
let lineBrkReg = /(\r\n){1,}/g
let lineBrkString = '\r\n';

let fpathCount = 0;
let fpathMap = {};

let runner = require('./runner')

const thisUtil = {
    run: () =>{
        thisUtil.runMultiTasks();
    },
    runMultiTasks: () =>{
        multiTaskUtil.beforePopTask();//get ready
        for(let i=0;i<Math.pow(10, 9);i++){
            let taskinfo = multiTaskUtil.popTask()
            if(taskinfo){
                runner.runCompare(taskinfo);
            }else{
                console.log('finished!')
                break;
            }
        }
    }
}
module.exports = thisUtil;