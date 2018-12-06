var fs = require('fs');
module.exports = {
    getAllFolders: function(dir) {
        var me= this;
        var results = []
        var list = fs.readdirSync(dir)
        list.forEach(function(file) {
            file = dir + '/' + file
            var stat = fs.statSync(file)
            if (stat && stat.isDirectory()) results.push(file);
        })
        return results;
    },
    getAllFiles: function(dir) {
    	var me= this;
        var results = []
        if(!fs.existsSync(dir)) return results;
        var list = fs.readdirSync(dir)
        list.forEach(function(file) {
            file = dir + '/' + file
            var stat = fs.statSync(file)
            if (stat && stat.isDirectory()) results = results.concat(me.getAllFiles(file))
            else results.push(file)
        })
        return results;
    },
    eachPath: function(dir, regs, fn){
    	var me = this;
        var allFileList = me.getAllFiles(dir);
        for(var j = 0, lenj = regs.length; j < lenj; j++){
            var reg = regs[j];
            for(var i = 0, len = allFileList.length; i < len; i++){
                var path = allFileList[i];
                if(reg.test(path)){
                    (fn)(path);
                }else{
                    if(reg.test(path)){
                        (fn)(path);
                    }
                }
            }
        }
    },
    eachContent: function(dir, regs, fn){
    	var me = this;
        me.eachPath(dir, regs, function(path){
            var content = fs.readFileSync(path,'utf8');
            var states = fs.statSync(path);
            (fn)(content, path, states);
        });            
    },
}