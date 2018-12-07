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
        let runFilters = (fpath)=>{
            let ok = true;
            filterFuns.forEach((filter)=>{
                if(filter(fpath)===false) ok = false;
            })
            return ok;
        };
        let fCount = 0;
        fileUtil.eachContent(codePath, [/\.js$/], (src, fpath)=>{
            fpath = fpath.replace(/\\{1,}/, '/');
            fpath = fpath.replace(/\/{1,}/, '/');
            //console.log(runFilters(fpath), fpath)
            if(runFilters(fpath)){
                sourceMap[fpath] = true;
                fCount++;
            }
        });
        let shouldSize = (fCount * (fCount-1))/2;
        let pairsList = []
        let count=0
        //let amap = new Set()
        let amap = {};
        for(let fpath1 in sourceMap){
            for(let fpath2 in sourceMap){
                if(fpath1 !== fpath2){
                    let hash1 = md5Util(fpath2+fpath1)
                    let hash2 = md5Util(fpath1+fpath2)
                    if(!amap[hash1] && !amap[hash2]) {
                    //if(fpath1 !== fpath2 && !amap.has(hash1+hash2) && !amap.has(hash2+hash1)) {
                        count++;
                        let arr = [fpath1, fpath2];
                        arr.sort();
                        pairsList.push({
                            a: arr[0],
                            b: arr[1]
                        })
                        if(count % 77777 === 0) console.log('pairs='+count+'/'+shouldSize, ' complete=', (count/shouldSize)*100+'%')
                        amap[hash1]=1;
                        //amap.add(hash1+hash2)
                    }
                }
            }
        }
        console.log('files='+fCount, shouldSize, 'matched='+pairsList.length===shouldSize)
        if(pairsList.length < 10000) fs.writeFileSync('./debuginfo/pairs.json', JSON.stringify(pairsList))
        return {
            pairs: pairsList,
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
        if(pairs.length < 10000) fs.writeFileSync('./debuginfo/srcmap.json', JSON.stringify(srcmap))
        let report = []
        let count = 0;
        console.log('pairs', pairs.length);
        for(let i=0;i<pairs.length;i++){
            let path1 = pairs[i].a;
            let path2 = pairs[i].b;
            let source1 = fs.readFileSync(path1,'utf8');//srcmap[path1];
            let source2 = fs.readFileSync(path2,'utf8');//srcmap[path2];

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
            if(count % 23 === 0) console.log((count/pairs.length)*100+'%')
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