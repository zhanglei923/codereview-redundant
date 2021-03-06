var fs = require('fs');
var _ = require('lodash');
var md5Util = require("blueimp-md5")//https://github.com/blueimp/JavaScript-MD5
var pathutil = require('path');
var jsdiff = require('diff');
let eachcontent = require('eachcontent-js')
let scriptUtil = require('../util/scriptUtil')
let multiTaskUtil = require('../util/multiTaskUtil')
let displayUtil = require('../util/displayUtil')
let cacheUtil = require('../util/cacheUtil')

let fpathCount = 0;
let fpathMap = {};

let SIZE_OF_NOISE = 4;

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

            //确保文件较小的在前，文件较大的在后
            let txta,txtb;
            if(source1.length < source2.length){
                txta = source1;
                txtb = source2;
            }else{
                txta = source2;
                txtb = source1;
            }
            source1 = txta;
            source2 = txtb;

            let ssss = source1+source2;
            // let hash1 = cacheUtil.md5(source1);
            // let hash2 = cacheUtil.md5(source2);
            let hhhh = cacheUtil.md5(ssss);
            ssss = null;

            // let hash1 = cacheUtil.md5(source1);
            // let hash2 = cacheUtil.md5(source2);
            let key = `${hhhh}`;

            let reddntLine = cacheUtil.getCache('compared_linenum', key)
            if(typeof reddntLine === 'undefined' || reddntLine === null){
                source1 = scriptUtil.cleanCode(source1, path1)
                source2 = scriptUtil.cleanCode(source2, path2);
    
                //console.log(source1, source2)
                reddntLine = thisUtil.getRedundantLine(source1, source2);
                cacheUtil.setCache('compared_linenum', key, reddntLine);
            }else{
                if(!reddntLine) reddntLine = 0;
                reddntLine = parseInt(reddntLine);
            }
            //console.log(reddntLine, path1+':'+path2)
            let count = i;
            let costms = new Date() - timems;
            timems = new Date();
            if(count % 477 === 0) {
                console.log(`[${displayUtil.percentage(currentTaskNum, totalTaskNum)}%]#${workerId}:tasks=${currentTaskNum}/${totalTaskNum}`, 
                            'ms='+costms, 
                            '('+displayUtil.percentage(count, pairs.length)+'%)'
                            )
            }
            if(costms > 2*60*1000){
                console.log('loooongtime:', costms)
                console.log('path1=', path1)
                console.log('path2=', path2)
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
    getRedundantLine: (source1, source2, debug) =>{
        if(typeof debug === 'undefined') debug = false;
        let redundantLine = 0;
        var diffInfo = jsdiff.diffTrimmedLines(source1, source2);
        let sametexts = ''
        diffInfo.forEach((info)=>{
            if(!info.removed && !info.added) {
                if(info.count > SIZE_OF_NOISE){
                    redundantLine += info.count;
                    if(debug) sametexts += info.value;
                }
            }
        })
        return redundantLine;
    }
}
module.exports = thisUtil;