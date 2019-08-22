var fs = require('fs');
var _ = require('lodash');
let pathutil = require('path')
var blueimp_md5 = require("blueimp-md5")//https://github.com/blueimp/JavaScript-MD5
let makeDir = require('make-dir')

let cache_folder = pathutil.resolve(__dirname,'../../codereview-redundant-cache/')

let getL1L2_bk = (id)=>{
    let arr = id.split('-');
    let hash1 = arr[0];
    let hash2 = arr[1];
    let l1 = hash1.substring(0,2);
    let l2 = hash2.substring(0,2);
    return `${l1}/${l2}`;
}
let getL1L2 = (id)=>{
    let l1 = id.substring(0,2);
    let l2 = id.substring(2,3);
    l2 = isNaN(l2) ? '' : l2;
    return `${l1}${l2}`;
}
let serRootFolder = (folder)=>{
    if(!fs.existsSync(folder)){
        console.error('[ERROR] cache folder not found:'+ folder)
    }
    cache_folder = folder;
    makeDir.sync(`${cache_folder}`)
    console.log(`[cache]${cache_folder}`)
}
serRootFolder(cache_folder)
let getFolder = (cacheType, id)=>{
    if(!fs.existsSync(cache_folder)){
        console.log(`cache_folder ${cache_folder} not exist.`);
        return;
    }
    let folder = `${cache_folder}/${cacheType}`;
    if(!fs.existsSync(folder)) fs.mkdirSync(folder);
    return folder;
}
let setCache = (cacheType, id, content)=>{
    let folder = getFolder(cacheType, id)
    if(!folder) return;
    let l1l2 = getL1L2(id);
    makeDir.sync(`${folder}/${l1l2}`)
    let fpath = `${folder}/${l1l2}/${id}.ca`;
    fs.writeFileSync(fpath, content);
}
let getCache = (cacheType, id)=>{
    let folder = getFolder(cacheType, id)
    if(!folder) return;
    let l1l2 = getL1L2(id);
    let fpath = `${folder}/${l1l2}/${id}.ca`;
    if(!fs.existsSync(fpath)) return null;
    let content = fs.readFileSync(fpath, 'utf8')
    return content;
}
let removeCache = (cacheType, id)=>{
    let folder = getFolder(cacheType, id)
    if(!folder) return;
    let l1l2 = getL1L2(id);
    let fpath = `${folder}/${l1l2}/${id}.ca`;
    fs.unlinkSync(fpath, ()=>{

    });
}

module.exports = {
    md5:(str)=>{
        str = str ? str : '';
        return blueimp_md5(str);
    },
    serRootFolder,
    getL1L2,
    cache_folder,
    setCache,
    getCache,
    removeCache,
}