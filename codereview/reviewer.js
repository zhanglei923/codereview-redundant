var fs = require('fs');
var pathutil = require('path');
var jsdiff = require('diff');
var decomment = require('decomment');
let fileUtil = require('../util/fileUtil')
let fmap = {};
const thisUtil = {
    getPairs: (codePath, filters)=>{
        let fCount = 0;
        fileUtil.eachContent(codePath, [/\.js$/], (src, fpath)=>{
            fmap[fpath] = src;
            fCount++;
        });
        let pairsMap = {}
        for(let fpath1 in fmap){
            for(let fpath2 in fmap){
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
        fs.writeFileSync('./a.txt', JSON.stringify(pairs))
        return pairs;
    },
    check: (codePath, filters) =>{
        fs.writeFileSync('./fmap.txt', JSON.stringify(fmap))
        let pairs = thisUtil.getPairs(codePath, filters);
        let rpt = []
        for(let i=0;i<pairs.length;i++){
            let source1 = fmap[pairs[i].a];
            let source2 = fmap[pairs[i].b];

            source1 = decomment(source1);
            source2 = decomment(source2);

            source1 = source1.replace(/(\r\n){1,}/g, '\n');
            source2 = source2.replace(/(\r\n){1,}/g, '\n');

            source1 = source1.replace(/(\n){1,}/g, '\n');
            source2 = source2.replace(/(\n){1,}/g, '\n');

            //console.log(source1, source2)
            let reddntLine = thisUtil.getRedundantLine(source1, source2);
            rpt.push(reddntLine)
        }
        fs.writeFileSync('./rpt.json', JSON.stringify(rpt))
    },
    getRedundantLine: (source1, source2) =>{
        //确保文件较小的在前，文件较大的在后
        var diff1 = source1.length < source2.length ? jsdiff.diffTrimmedLines(source1, source2) : jsdiff.diffTrimmedLines(source2, source1);
        return diff1;

    }
}
module.exports = thisUtil;