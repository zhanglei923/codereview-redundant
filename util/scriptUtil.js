var fs = require('fs');
var decomment = require('decomment');
const stripcomments = require('strip-comments');
module.exports = {
    decomment: function(src) {
        try{
            src = stripcomments(src);//decomment(src);
        }catch(e){
            //throw e;
        }
        return src;
    }
}