var fs = require('fs');
var pathutil = require('path');

let thisUtil = {
    taskCount: 0,
    taskFolder: null,
    taskId: (''+Math.random()).replace(/\./g, ''),
    init: (ctxPath)=>{
        thisUtil.taskCount = 0;
        thisUtil.ctxPath = ctxPath;
        console.log('ctxpath1', ctxPath)
    },
    initTaskFolder: ()=>{
        console.log('ctxpath2', thisUtil.ctxPath)
        thisUtil.taskFolder = pathutil.resolve(thisUtil.ctxPath, './tasks_'+thisUtil.taskId)
        fs.mkdirSync(thisUtil.taskFolder);
    },
    savePathMap: (fmap)=>{
        let filepath = pathutil.resolve(thisUtil.taskFolder, `./fmap`);
        fs.writeFileSync(filepath, JSON.stringify(fmap))
    },
    saveSubTasks: (tasks)=> {
        let filepath = pathutil.resolve(thisUtil.taskFolder, `./tasks${thisUtil.taskCount}`);
        thisUtil.taskCount++;
        let savestr = ''
        tasks.forEach((task)=>{
            savestr += task[0]+':'+task[1]+',';
        })
        fs.writeFileSync(filepath, savestr)
    },
    verify: (shouldPairSize)=>{
        let fmap = fs.readFileSync(pathutil.resolve(thisUtil.taskFolder, `./fmap`))
        fmap = JSON.parse(fmap);
        
        let dir = thisUtil.taskFolder;
        var count = 0;
        var list = fs.readdirSync(dir)
        list.forEach(function(file) {
            file = dir + '/' + file
            var stat = fs.statSync(file)
            if (stat && !stat.isDirectory() && !/fmap$/.test(file)) {
                let txt = fs.readFileSync(file, 'utf8');
                txt = txt.replace(/\,$/,'')
                let arr = txt.split(',');
                count+=arr.length;
            }
        })
        console.log(count)
        return count === shouldPairSize;
    }
}
module.exports = thisUtil;