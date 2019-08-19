var fs = require('fs');
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
    cleanCode: (source)=>{
        // if(path1.indexOf('createDialogCtrl')>=0) fs.writeFileSync('./a.js', source1)
        // if(path2.indexOf('updateDialogCtrl')>=0) fs.writeFileSync('./b.js', source2)
        source = thisUtil.decomment(source);
        source = source.replace(lineBrkReg, lineBrkString);
        source = source.replace(/function[\s]{0,}\(/g, 'function(')
        source = source.replace(/(\r\n)?{/g, '{')
        source = source.replace(/( ){1,}/g,'')//防止有人格式化代码，绕过行对比
        source = source.replace(/\}( ){1,}\;/g,'};')//防止有人格式化代码，绕过行对比
        return source;
    }
}
module.exports = thisUtil;