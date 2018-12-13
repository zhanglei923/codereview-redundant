var fs = require('fs');
var _ = require('lodash');
var md5Util = require("blueimp-md5")//https://github.com/blueimp/JavaScript-MD5
var pathutil = require('path');
var jsdiff = require('diff');
let eachcontent = require('eachcontent-js')
let scriptUtil = require('../util/scriptUtil')
let multiTaskUtil = require('../util/multiTaskUtil')
let displayUtil = require('../util/displayUtil')
let lineBrkReg = /(\r\n){1,}/g
let lineBrkString = '\r\n';

let fpathCount = 0;
let fpathMap = {};

let SIZE_OF_NOISE = 5;

const thisUtil = {
    runCompare:(taskinfo, displayInfo)=>{
        var pairs = taskinfo.task;
        let taskname = taskinfo.taskname;
        let fpathmap = multiTaskUtil.fmap;


        let currentTaskNum = displayInfo.currentTaskNum
        let totalTaskNum = displayInfo.totalTaskNum
        let workerId = displayInfo.workerId

        console.log('run', taskname)

        let timems = new Date();
        let report = []
        for(let i=0;i<pairs.length;i++){
            let key1 = pairs[i].a;
            let key2 = pairs[i].b;
            let path1 = fpathmap[key1].fpath;
            let path2 = fpathmap[key2].fpath;
            //console.log(path1)
            let source1 = fs.readFileSync(path1,'utf8');//fpathmap[path1];
            let source2 = fs.readFileSync(path2,'utf8');//fpathmap[path2];

            source1 = scriptUtil.decomment(source1);
            source2 = scriptUtil.decomment(source2);

            source1 = source1.replace(lineBrkReg, lineBrkString);
            source2 = source2.replace(lineBrkReg, lineBrkString);

            source1 = source1.replace(/function[\s]{0,}\(/g, 'function(')
            source2 = source2.replace(/function[\s]{0,}\(/g, 'function(')

            // if(path1.indexOf('createDialogCtrl')>=0) fs.writeFileSync('./a.js', source1)
            // if(path2.indexOf('updateDialogCtrl')>=0) fs.writeFileSync('./b.js', source2)

            //console.log(source1, source2)
            let reddntLine = thisUtil.getRedundantLine(source1, source2);
            //console.log(reddntLine, path1+':'+path2)
            let count = i;
            if(count % 477 === 0) {
                let costms = new Date() - timems;
                console.log(`[${displayUtil.percentage(currentTaskNum, totalTaskNum)}%]#${workerId}:tasks=${currentTaskNum}/${totalTaskNum}`, 
                            'ms='+costms, 
                            '('+displayUtil.percentage(count, pairs.length)+'%)'
                            )
                timems = new Date();
            }
            report.push({
                a:key1, 
                b:key2,
                l:reddntLine
            })
        }
        report = _.sortBy(report, 'l').reverse();
        multiTaskUtil.saveReport(taskname, report);
    },
    getRedundantLine: (source1, source2) =>{
        let redundantLine = 0;
        //确保文件较小的在前，文件较大的在后
        var diffInfo = source1.length < source2.length ? jsdiff.diffTrimmedLines(source1, source2) : jsdiff.diffTrimmedLines(source2, source1);
        diffInfo.forEach((info)=>{
            if(!info.removed && !info.added) {
                if(info.count > SIZE_OF_NOISE)
                redundantLine += info.count;
            }
        })
        return redundantLine;
    }
}
module.exports = thisUtil;