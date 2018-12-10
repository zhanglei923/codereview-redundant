var fs = require('fs');
var _ = require('lodash');
var md5Util = require("blueimp-md5")//https://github.com/blueimp/JavaScript-MD5
var pathutil = require('path');
var jsdiff = require('diff');
let fileUtil = require('../util/fileUtil')
let scriptUtil = require('../util/scriptUtil')
let lineBrkReg = /(\r\n){1,}/g
let lineBrkString = '\r\n';

let fpathCount = 0;
let fpathMap = {};

const thisUtil = {
    check: (codePath, filters) =>{
        let info = thisUtil.getFilePathMap(codePath, filters);
        return thisUtil.checkPairs(info);
    },
    getFilePathMap: (codePath, filters)=>{
        if(typeof filters.functions === 'undefined') filters.functions = [()=>{return true;}]        
        let fpathCount = 0;
        let fpathMap = {};
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
                let fkey = ''+fpathCount.toString(36)
                fpathMap[fkey] = {
                    fpath,
                    idx: fpathCount
                };
                fpathCount++;
            }
        });
        let shouldPairSize = (fpathCount * (fpathCount-1))/2;
        console.log(fpathCount,'=>', shouldPairSize)
        return {
            fpathCount,
            shouldPairSize,
            fpathMap
        };
    },
    _can_compare: (key1, key2, fpathmap)=>{
        //原理是判断i，j是否位于矩阵的右上半区（不含中线）：
        //   1 2 3 4 5
        // 1 x o o o o
        // 2 - x o o o
        // 3 - - x o o
        // 4 - - - x o
        // 5 - - - - x
        let o1 = fpathmap[key1];
        let o2 = fpathmap[key2];
        if(o1.idx < o2.idx){
            return true;
        }else{
            return false;
        }
    },
    checkPairs: (info) =>{
        let fpathmap = info.fpathMap;
        fs.writeFileSync('./.report/fpathmap1.json', JSON.stringify(fpathmap))
        let report = []
        let count = 0;
        
        for(let key1 in fpathmap){
            let o1 = fpathmap[key1];
            for(let key2 in fpathmap){
                let o2 = fpathmap[key2];
                let ok = thisUtil._can_compare(key1, key2, fpathmap);
                if(ok) {
                    count++;
                }
            }
        }
        let sizeMatched = (count===info.shouldPairSize);
        console.log('!!!', count,'=', info.shouldPairSize, sizeMatched)
        if(!sizeMatched) throw new Exception('SIZE NOT MATCHED')



        let timems = new Date();
        for(let i=0;i<pairs.length;i++){
            let path1 = fpathmap[pairs[i].a];
            let path2 = fpathmap[pairs[i].b];
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