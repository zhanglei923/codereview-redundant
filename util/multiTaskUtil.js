var fs = require('fs');
var pathutil = require('path');

let thisUtil = {
    CLUSTER_SIZE: 5000,
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
    saveSubTasks: (task)=> {
        let filepath = pathutil.resolve(thisUtil.taskFolder, `./task${thisUtil.taskCount}`);
        thisUtil.taskCount++;
        let savestr = []
        task.forEach((t)=>{
            savestr.push(t[0]+':'+t[1]);
        })
        fs.writeFileSync(filepath, savestr.join(','))
    },
    loadFileMap:()=>{
        let fmap = fs.readFileSync(pathutil.resolve(thisUtil.taskFolder, `./fmap`),'utf8')
        fmap = JSON.parse(fmap);
        return fmap;
    },
    loadTask:(taskname)=>{
        console.log('load:', taskname)
        let txt = fs.readFileSync(pathutil.resolve(thisUtil.taskFolder, `./${taskname}`),'utf8')
        txt = txt.replace(/\,$/,'')
        let arr = txt.split(',');
        let task = []
        arr.forEach((o)=>{
            let pair = {
                a: o.split(':')[0],
                b: o.split(':')[1]
            }
            task.push(pair);
        })
        return {
            task, 
            taskname
        };
    },
    saveReport:(taskname, report)=>{
        console.log('save', taskname)
        let filepath = pathutil.resolve(thisUtil.reportFolder, `./${taskname}`);
        fs.writeFileSync(filepath, JSON.stringify(report))
    },
    currentTaskStack: [],
    beforePopTask: ()=>{
        thisUtil.currentTaskStack = [];
        thisUtil.eachTasksFile((taskinfo)=>{
            thisUtil.currentTaskStack.push(taskinfo.taskname);
        });
        console.log(thisUtil.currentTaskStack.length)
    },
    popTask: ()=>{
        let taskname = thisUtil.currentTaskStack.shift();
        if(!taskname) return null;
        let o = thisUtil.loadTask(taskname);
        return o;
    },
    eachTasksFile: (callback)=>{
        let fmap = thisUtil.loadFileMap();
        let dir = thisUtil.taskFolder;
        var list = fs.readdirSync(dir)
        let tasksList = []
        list.forEach(function(file) {
            file = dir + '/' + file
            var stat = fs.statSync(file)
            if (stat && !stat.isDirectory() && !/fmap$/.test(file)) {
                let pathinfo = pathutil.parse(file)
                let filename = pathinfo.name;
                let taskname = filename;
                //console.log(filename)
                let taskinfo = thisUtil.loadTask(taskname);
                tasksList.push(taskinfo)
            }
        });
        thisUtil.totalTaskCount = tasksList.length;
        thisUtil.fmap = fmap;
        tasksList.forEach((info, i)=>{            
            callback({ 
                        task: info.task, 
                        taskname:info.taskname
                    });
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