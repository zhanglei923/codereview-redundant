var fs = require('fs');
var _ = require('lodash');
var md5Util = require("blueimp-md5")//https://github.com/blueimp/JavaScript-MD5
var pathutil = require('path');
var jsdiff = require('diff');
var decomment = require('decomment');
let fileUtil = require('../util/fileUtil')

let lineBrkReg = /(\r\n){1,}/g
let lineBrkString = '\r\n';

let fpathCount = 0;
let fpathMap = {};

const thisUtil = {
    check: (codePath, filters) =>{
        let info = thisUtil.loadFilesInfo(codePath, filters);
        let pairs = info.pairs;
        let fpathMap = info.fpathMap;
        return thisUtil.checkPairs(pairs, fpathMap);
    },
    loadFilesInfo: (codePath, filters)=>{
        if(typeof filters.functions === 'undefined') filters.functions = [()=>{return true;}]        
        let runFilters = (fpath)=>{
            let ok = true;
            filters.functions.forEach((filter)=>{
                if(filter(fpath)===false) ok = false;
            })
            return ok;
        };
        fileUtil.eachContent(codePath, filters.regexs, (src, fpath)=>{
            fpath = fpath.replace(/\\{1,}/, '/');
            fpath = fpath.replace(/\/{1,}/, '/');
            //console.log(runFilters(fpath), fpath)
            if(runFilters(fpath)){
                let fkey = fpathCount.toString(32)
                fpathMap[fkey] = fpath;
                fpathCount++;
            }
        });
        let shouldSize = (fpathCount * (fpathCount-1))/2;
        console.log(fpathCount,'=>', shouldSize)

        let pairsList = []
        let count=0
        //let amap = new Set()
        let amap = {};
        for(let fkey1 in fpathMap){
            for(let fkey2 in fpathMap){
                if(fkey1 !== fkey2){
                    if(!amap[fkey1+fkey2] && !amap[fkey2+fkey1]) {
                        count++;
                        let arr = [fkey1, fkey2];
                        arr.sort();
                        pairsList.push({
                            a: arr[0],
                            b: arr[1]
                        });
                        if(count % 77777 === 0) {
                            console.log('pairs='+count+'/'+shouldSize, ' complete=', (count/shouldSize)*100+'%')
                        }
                        amap[fkey1+fkey2]= 1;
                    }
                }
            }
        }
        let ismatch = (pairsList.length*1===shouldSize*1)
        console.log('files='+fpathCount, shouldSize+'=='+pairsList.length, ismatch?'matched':'not-match! stop-running!')
        if(!ismatch) throw new Exception('not-match! stop-running!');
        if(pairsList.length < 10000) fs.writeFileSync('./.report/pairs.json', JSON.stringify(pairsList))
        return {
            pairs: pairsList,
            fpathMap
        };
    },
    checkPairs: (pairs, fpathmap) =>{
        if(pairs.length < 10000) fs.writeFileSync('./.report/fpathmap.json', JSON.stringify(fpathmap))
        let report = []
        let count = 0;
        console.log('pairs', pairs.length);
        let timems = new Date();
        for(let i=0;i<pairs.length;i++){
            let path1 = fpathmap[pairs[i].a];
            let path2 = fpathmap[pairs[i].b];
            let source1 = fs.readFileSync(path1,'utf8');//fpathmap[path1];
            let source2 = fs.readFileSync(path2,'utf8');//fpathmap[path2];

            source1 = decomment(source1);
            source2 = decomment(source2);

            source1 = source1.replace(lineBrkReg, lineBrkString);
            source2 = source2.replace(lineBrkReg, lineBrkString);

            // source1 = source1.replace(/(\r\n){1,}/g, lineBrkString);
            // source2 = source2.replace(/(\r\n){1,}/g, lineBrkString);

            //console.log(source1, source2)
            let reddntLine = thisUtil.getRedundantLine(source1, source2);
            //console.log(reddntLine, path1+':'+path2)
            count++;
            if(count % 23 === 0) {
                let costms = new Date() - timems;
                console.log('count='+count, 'ms='+costms, (count/pairs.length)*100+'%')
                timems = new Date();
            }
            report.push({
                path1, path2,
                reddntLine
            })
        }
        report = _.sortBy(report, 'reddntLine').reverse();
        return report;
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