var fs = require('fs');
var decomment = require('decomment');
module.exports = {
    decomment: function(src) {
        try{
            src = decomment(src);
        }catch(e){
            
        }
        return src;
    }
}