var fs = require('fs');
var _ = require('lodash');
var md5Util = require("blueimp-md5")//https://github.com/blueimp/JavaScript-MD5
var pathutil = require('path');
var jsdiff = require('diff');
var decomment = require('decomment');
let fileUtil = require('../util/fileUtil')

let lineBrkReg = /(\r\n){1,}/g
let lineBrkString = '\r\n';
let sourceMap = {};

const thisUtil = {
    loadFilesInfo: (codePath, filters, filterFuns)=>{
        if(typeof filterFuns === 'undefined') filterFuns = [()=>{return true;}]        
        let runFilters = (fpath1, fpath2)=>{
            let ok = true;
            filterFuns.forEach((filter)=>{
                if(filter(fpath1)===false) ok = false;
                if(filter(fpath2)===false) ok = false;
            })
            return ok;
        };
        let fCount = 0;
        fileUtil.eachContent(codePath, [/\.js$/], (src, fpath)=>{
            sourceMap[fpath] = src;
            fCount++;
        });
        let pairsMap = {}
        for(let fpath1 in sourceMap){
            for(let fpath2 in sourceMap){
                if(fpath1 !== fpath2 && runFilters(fpath1, fpath2)) {
                    let arr = [fpath1, fpath2];
                    arr.sort();
                    pairsMap[arr.join(',')]=true;
                }
            }
        }
        let pairsCount = 0; // size = (n*(n-1))/2
        let pairs = []
        for(let name in pairsMap){
            let arr = name.split(',');
            pairs.push({a: arr[0], b: arr[1]})
            pairsCount++
        }
        console.log('fCount', fCount, pairs.length)
        fs.writeFileSync('./debuginfo/pairs.json', JSON.stringify(pairs))
        return {
            pairs,
            sourceMap
        };
    },
    check: (codePath, filters, filterFuns) =>{
        let info = thisUtil.loadFilesInfo(codePath, filters, filterFuns);
        let pairs = info.pairs;
        let sourceMap = info.sourceMap;
        return thisUtil.checkPairs(pairs, sourceMap);
    },
    _asMd5Lines: (source) =>{
        let arr = source.split(lineBrkReg)
        let arr2 = [];
        arr.forEach((line)=>{
            arr2.push(md5Util(line));
        })
        return arr2.join(lineBrkString);
    },
    _asHalfLines: (source) =>{
        //return source;
        let arr = source.split(lineBrkReg)
        let arr2 = [];
        arr.forEach((line, i)=>{
            //console.log(i, line, line===lineBrkString)
            if(i%2===0 && line !== lineBrkString) arr2.push(line);
        })
        return arr2.join(lineBrkString);
    },
    checkPairs: (pairs, srcmap) =>{
        fs.writeFileSync('./debuginfo/srcmap.json', JSON.stringify(srcmap))
        let report = []
        let count = 0;
        console.log('pairs', pairs.length);
        for(let i=0;i<pairs.length;i++){
            let path1 = pairs[i].a;
            let path2 = pairs[i].b;
            let source1 = srcmap[path1];
            let source2 = srcmap[path2];

            source1 = decomment(source1);
            source2 = decomment(source2);

            // source1 = thisUtil._asMd5Lines(source1);
            // source2 = thisUtil._asMd5Lines(source2);
            // source1 = thisUtil._asHalfLines(source1);
            // source2 = thisUtil._asHalfLines(source2);

            source1 = source1.replace(lineBrkReg, lineBrkString);
            source2 = source2.replace(lineBrkReg, lineBrkString);

            // source1 = source1.replace(/(\r\n){1,}/g, lineBrkString);
            // source2 = source2.replace(/(\r\n){1,}/g, lineBrkString);

            //console.log(source1, source2)
            let reddntLine = thisUtil.getRedundantLine(source1, source2);
            //console.log(reddntLine, path1+':'+path2)
            count++;
            if(count % 23 === 0) console.log(count,'/', pairs.length)
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