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
        thisUtil.eachTasksFile((task, info)=>{
            thisUtil.currentTaskStack.push({
                task,
                info
            })
        });
        console.log(thisUtil.currentTaskStack.length)
    },
    popTask: ()=>{
        let o = thisUtil.currentTaskStack.shift();
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
                tasksList.push({
                    tasks, 
                    taskname
                })
            }
        });
        tasksList.forEach((info, i)=>{            
            callback(info.tasks, {
                                    totalTaskCount: tasksList.length,
                                    taskname:info.taskname, 
                                    fmap
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