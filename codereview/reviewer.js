var fs = require('fs');
var pathutil = require('path');
let fileUtil = require('../util/fileUtil')
module.exports = {
    check: (codePath, filters) =>{
        let fCount = 0;
        let fmap = {}
        fileUtil.eachContent(codePath, [/\.js$/], (src, fpath)=>{
            fmap[fpath] = src;
            fCount++;
        });
        let pairs = {}
        for(let fpath1 in fmap){
            for(let fpath2 in fmap){
                if(fpath1 !== fpath2) {
                    let arr = [fpath1, fpath2];
                    arr.sort();
                    pairs[arr.join(',')]=true;
                }
            }
        }
        let pairsCount = 0; // size = (n*(n-1))/2
        for(let name in pairs){
            pairsCount++
        }
        console.log('fCount', fCount, pairsCount)
        fs.writeFileSync('./a.txt', JSON.stringify(pairs))
    }
}