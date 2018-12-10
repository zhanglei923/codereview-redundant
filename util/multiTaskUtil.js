var fs = require('fs');
var pathutil = require('path');

let thisUtil = {
    taskCount: 0,
    taskFolder: null,
    taskId: (''+Math.random()).replace(/\./g, ''),
    reportFolder: null,
    init: (ctxPath)=>{
        thisUtil.taskCount = 0;
        thisUtil.ctxPath = ctxPath;
        console.log('ctxpath1', ctxPath)
    },
    initTaskFolder: ()=>{
        console.log('ctxpath2', thisUtil.ctxPath)
        thisUtil.taskFolder = pathutil.resolve(thisUtil.ctxPath, './tasks_'+thisUtil.taskId)
        thisUtil.reportFolder = pathutil.resolve(thisUtil.ctxPath, './tasks_'+thisUtil.taskId+'_report')
        fs.mkdirSync(thisUtil.taskFolder);
        fs.mkdirSync(thisUtil.reportFolder);
    },
    savePathMap: (fmap)=>{
        let filepath = pathutil.resolve(thisUtil.taskFolder, `./fmap`);
        fs.writeFileSync(filepath, JSON.stringify(fmap))
    },
    saveSubTasks: (tasks)=> {
        let filepath = pathutil.resolve(thisUtil.taskFolder, `./tasks${thisUtil.taskCount}`);
        thisUtil.taskCount++;
        let savestr = []
        tasks.forEach((task)=>{
            savestr.push(task[0]+':'+task[1]);
        })
        fs.writeFileSync(filepath, savestr.join(','))
    },
    loadFileMap:()=>{
        let fmap = fs.readFileSync(pathutil.resolve(thisUtil.taskFolder, `./fmap`))
        fmap = JSON.parse(fmap);
        return fmap;
    },
    saveReport:(taskname, report)=>{
        let filepath = pathutil.resolve(thisUtil.reportFolder, `./${taskname}`);
        fs.writeFileSync(filepath, JSON.stringify(report))
    },
    eachTasksFile: (callback)=>{
        let fmap = thisUtil.loadFileMap();
        let dir = thisUtil.taskFolder;
        var list = fs.readdirSync(dir)
        list.forEach(function(file) {
            file = dir + '/' + file
            var stat = fs.statSync(file)
            if (stat && !stat.isDirectory() && !/fmap$/.test(file)) {
                let pathinfo = pathutil.parse(file)
                let filename = pathinfo.name;
                let taskname = filename;
                //console.log(filename)
                let txt = fs.readFileSync(file, 'utf8');
                txt = txt.replace(/\,$/,'')
                let arr = txt.split(',');
                let tasks = []
                arr.forEach((o)=>{
                    let pair = {
                        a: o.split(':')[0],
                        b: o.split(':')[1]
                    }
                    tasks.push(pair);
                })
                callback(tasks, taskname, fmap)
            }
        })
    },
    verify: (shouldPairSize)=>{
        var count = 0;
        thisUtil.eachTasksFile((taskArr)=>{            
            count+=taskArr.length;
        })
        return count === shouldPairSize;
    }
}
module.exports = thisUtil;