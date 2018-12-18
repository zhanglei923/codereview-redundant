var fs = require('fs');
var _ = require('lodash');
var md5Util = require("blueimp-md5")//https://github.com/blueimp/JavaScript-MD5
var pathutil = require('path');
var jsdiff = require('diff');
let eachcontent = require('eachcontent-js')
let scriptUtil = require('../util/scriptUtil')
let multiTaskUtil = require('../util/multiTaskUtil')
let lineBrkReg = /(\r\n){1,}/g
let lineBrkString = '\r\n';

let fpathCount = 0;
let fpathMap = {};

const thisUtil = {
    generate: (codePath, filters, callback) =>{
        let info = thisUtil.getFilePathMap(codePath, filters);
        let taskId = thisUtil.generateMultiTasks(info);
        return taskId;
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
        eachcontent.eachContent(codePath, filters.regexs, (src, fpath)=>{
            fpath = fpath.replace(/\\{1,}/, '/');
            fpath = fpath.replace(/\/{1,}/, '/');
            //console.log(runFilters(fpath), fpath)
            if(runFilters(fpath)){
                let fkey = ''+fpathCount.toString(36)
                //console.log('>>', fpathCount, fkey)
                fpathMap[fkey] = {
                    fkey,
                    lineNum: src.split('\n').length,
                    fpath,
                    idx: fpathCount
                };
                fpathCount++;
            }
        });
        fpathMap = thisUtil._rebalence_linenum(fpathMap);//按照linenum均匀排布一下，让计算时间更平均
        let shouldPairSize = (fpathCount * (fpathCount-1))/2;
        console.log(fpathCount,'=>', shouldPairSize)
        return {
            fpathCount,
            shouldPairSize,
            fpathMap
        };
    },
    _rebalence_linenum: (map)=>{
        let arr = [];
        for(let key in map){
            arr.push(map[key]);
        }
        arr = _.sortBy(arr, [function(o) { return o.lineNum; }])
        // let s=''
        // arr.forEach((o)=>{
        //     s+=(','+o.lineNum)
        // })
        // console.log(s)
        let len = arr.length;
        let half1 = Math.floor(len/2);
        let half2 = len - half1;
        let halfArr1 = [];
        let halfArr2 = [];
        for(let i=0;i<arr.length;i++){
            if(i<=half1) {
                halfArr1.push(arr[i])
            }else{
                halfArr2.push(arr[i])
            }
        }
        halfArr2.reverse();
        let resultArr = []
        for(let i=0;i<len*2;i++){
            let o1;
            let o2;
            o1 = halfArr1.shift();if(o1)resultArr.push(o1);
            o2 = halfArr2.shift();if(o2)resultArr.push(o2);
            if(!o1 && !o2)break;
        }
        let newmap = {};
        resultArr.forEach((o, i)=>{
            o.idx = i;
            newmap[o.fkey] = o;
        })
        delete map;
        fs.writeFileSync('./.reports/_rebalence_linenum.json', JSON.stringify(resultArr))
        return newmap;
    },
    _can_compare: (key1, key2, fpathmap)=>{
        //原理是判断i，j是否位于矩阵的右上半区（不含中线）：
        //   1 2 3 4 5
        // 1 x o o o o
        // 2 x x o o o
        // 3 x x x o o
        // 4 x x x x o
        // 5 x x x x x
        let ok = true
        let o1 = fpathmap[key1];
        let o2 = fpathmap[key2];
        if(o1.idx < o2.idx){
            //ok = true;
        }else{
            ok = false;
        }
        let p1 = pathutil.parse(o1.fpath)
        let p2 = pathutil.parse(o2.fpath)
        // 有时也不必只对比同扩展名，比如ts和js文件，要同时比对
        //if(p1.ext !== p2.ext) ok = false;//只对比同扩展名的
        return ok;
    },
    generateMultiTasks: (info) =>{
        let fpathmap = info.fpathMap;
        fs.writeFileSync('./.reports/fpathmap1.json', JSON.stringify(fpathmap))
        let report = []
        let count = 0;
        
        let taskFolderInfo = multiTaskUtil.initTaskFolder()
        let subTasks = []
        for(let key1 in fpathmap){
            let o1 = fpathmap[key1];
            for(let key2 in fpathmap){
                let o2 = fpathmap[key2];
                let ok = thisUtil._can_compare(key1, key2, fpathmap);
                if(ok) {
                    subTasks.push([key1, key2]);
                    if(subTasks.length >= multiTaskUtil.CLUSTER_SIZE){
                        multiTaskUtil.saveSubTasks(subTasks);
                        subTasks = [];
                    }
                    count++;
                }
            }
        }
        multiTaskUtil.saveSubTasks(subTasks);
        multiTaskUtil.savePathMap(fpathmap);
        let ok = multiTaskUtil.verify(info.shouldPairSize);

        let sizeMatched = (count===info.shouldPairSize);
        console.log('-Task generated:', 'taskId='+taskFolderInfo.taskId,count,'=', info.shouldPairSize, sizeMatched, 'multiTaskUtil=', ok)
        if(!ok) throw ('VERIFY FAILED')
        if(!sizeMatched) throw ('SIZE NOT MATCHED')
        return taskFolderInfo.taskId;
    }
}
module.exports = thisUtil;