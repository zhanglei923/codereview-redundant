var fs = require('fs');
var _ = require('lodash');
var pathutil = require('path');
var jsdiff = require('diff');
var decomment = require('decomment');
let fileUtil = require('../util/fileUtil')
let sourceMap = {};
const thisUtil = {
    getPairs: (codePath, filters)=>{
        let fCount = 0;
        fileUtil.eachContent(codePath, [/\.js$/], (src, fpath)=>{
            sourceMap[fpath] = src;
            fCount++;
        });
        let pairsMap = {}
        for(let fpath1 in sourceMap){
            for(let fpath2 in sourceMap){
                if(fpath1 !== fpath2) {
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
    check: (codePath, filters) =>{
        let info = thisUtil.getPairs(codePath, filters);
        let pairs = info.pairs;
        let sourceMap = info.sourceMap;
        thisUtil.checkPairs(pairs, sourceMap);
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

            source1 = source1.replace(/(\r\n){1,}/g, '\n');
            source2 = source2.replace(/(\r\n){1,}/g, '\n');

            source1 = source1.replace(/(\n){1,}/g, '\n');
            source2 = source2.replace(/(\n){1,}/g, '\n');

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
        fs.writeFileSync('./debuginfo/report.json', JSON.stringify(report))
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