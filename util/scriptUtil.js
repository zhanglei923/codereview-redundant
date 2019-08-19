var fs = require('fs');
var pathutil = require('path');
var decomment = require('decomment');
const stripcomments = require('strip-comments');

let lineBrkReg = /(\r\n){1,}/g
let lineBrkString = '\r\n';

let thisUtil = {
    decomment: function(src) {
        try{
            src = stripcomments(src);//decomment(src);
        }catch(e){
            //throw e;
        }
        return src;
    },
    cleanCode: (source, fpath)=>{
        if(!source) source = '';
        let finfo = pathutil.parse(fpath);
        let ext = finfo.ext;
        if(ext) ext = ext.toLowerCase();
        if(ext === '.js' || ext === '.java'){
            source = thisUtil.decomment(source);
            source = source.replace(lineBrkReg, lineBrkString);
            source = source.replace(/function[\s]{0,}\(/g, 'function(')
            source = source.replace(/(\r\n)?{/g, '{')
            source = source.replace(/( ){1,}/g,'')//防止有人格式化代码，绕过行对比
            source = source.replace(/\}( ){1,}\;/g,'};')//防止有人格式化代码，绕过行对比
        }else{
            source = source.replace(lineBrkReg, lineBrkString);
            source = source.replace(/( ){1,}/g,'')//防止有人格式化代码，绕过行对比
        }
        return source;
    },
    isSameFileType: (fpath1, fpath2)=>{
        let p1 = pathutil.parse(fpath1)
        let p2 = pathutil.parse(fpath2)
        let ext1 = p1.ext;
        let ext2 = p2.ext;
        if(!ext1 && !ext2)return true;
        if(!ext1 && ext2) return false;
        if(!ext2 && ext1) return false;
        ext1 = ext1.toLowerCase()
        ext2 = ext2.toLowerCase()
        if(ext1 === '.ts') ext1 = '.js';// 有时也不必只对比同扩展名，比如ts和js文件，要同时比对
        if(ext2 === '.ts') ext2 = '.js'
        if(ext1 === ext2) {
            return true;
        }else{
            return false;
        }
    }
}
module.exports = thisUtil;