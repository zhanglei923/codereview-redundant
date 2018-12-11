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

const thisUtil = {
    run: () =>{
        thisUtil.runMultiTasks();
    },
    runMultiTasks: () =>{
        multiTaskUtil.beforePopTask();//get ready
        for(let i=0;i<Math.pow(10, 9);i++){
            let taskinfo = multiTaskUtil.popTask()
            if(taskinfo){
                thisUtil.runCompare(taskinfo);
            }else{
                console.log('finished!')
                break;
            }
        }
    },
    runCompare:(taskinfo)=>{
        var pairs = taskinfo.task;
        let taskname = taskinfo.taskname;
        let fpathmap = multiTaskUtil.fmap;
        let totalTaskCount = multiTaskUtil.totalTaskCount;

        console.log('run', taskname)

        let timems = new Date();
        let report = []
        for(let i=0;i<pairs.length;i++){
            let path1 = fpathmap[pairs[i].a].fpath;
            let path2 = fpathmap[pairs[i].b].fpath;
            //console.log(path1)
            let source1 = fs.readFileSync(path1,'utf8');//fpathmap[path1];
            let source2 = fs.readFileSync(path2,'utf8');//fpathmap[path2];

            source1 = scriptUtil.decomment(source1);
            source2 = scriptUtil.decomment(source2);

            source1 = source1.replace(lineBrkReg, lineBrkString);
            source2 = source2.replace(lineBrkReg, lineBrkString);

            // source1 = source1.replace(/(\r\n){1,}/g, lineBrkString);
            // source2 = source2.replace(/(\r\n){1,}/g, lineBrkString);

            //console.log(source1, source2)
            let reddntLine = thisUtil.getRedundantLine(source1, source2);
            //console.log(reddntLine, path1+':'+path2)
            let count = i;
            if(count % 177 === 0) {
                let costms = new Date() - timems;
                console.log('count='+count, 'ms='+costms, `multi-task: ${totalTaskCount}`, (count/pairs.length)*100+'%')
                timems = new Date();
            }
            report.push({
                path1, path2,
                reddntLine
            })
        }
        report = _.sortBy(report, 'reddntLine').reverse();
        multiTaskUtil.saveReport(taskname, report);
    },
    getRedundantLine: (source1, source2) =>{
        let redundantLine = 0;
        //确保文件较小的在前，文件较大的在后
        var diffInfo = source1.length < source2.length ? jsdiff.diffTrimmedLines(source1, source2) : jsdiff.diffTrimmedLines(source2, source1);
        diffInfo.forEach((info)=>{
            if(!info.removed && !info.added) {
                redundantLine += info.count;
            }
        })
        return redundantLine;
    }
}
module.exports = thisUtil;