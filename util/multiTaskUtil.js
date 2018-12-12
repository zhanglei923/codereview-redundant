let fs = require('fs');
let pathutil = require('path');
let moment = require('moment');
let _ = require('lodash')

let thisUtil = {
    CLUSTER_SIZE: 5000,
    taskCount: 0,
    taskFolder: null,
    taskId: (moment().format('YYYYMMDD_hhmmss'))+'-'+(Math.random()+'').replace(/\./g, '').substring(6),
    reportFolder: null,
    init: (ctxPath, taskId)=>{
        thisUtil.taskCount = 0;
        thisUtil.ctxPath = ctxPath;
        //console.log('ctxpath1', ctxPath)
        if(typeof taskId !== 'undefined') thisUtil.taskId = taskId;
    },
    initTaskFolder: ()=>{
        thisUtil.taskFolder = pathutil.resolve(thisUtil.ctxPath, './tasks_'+thisUtil.taskId)
        thisUtil.reportFolder = pathutil.resolve(thisUtil.ctxPath, './tasks_'+thisUtil.taskId+'_report')
        if (!fs.existsSync(thisUtil.taskFolder))fs.mkdirSync(thisUtil.taskFolder);
        if (!fs.existsSync(thisUtil.reportFolder))fs.mkdirSync(thisUtil.reportFolder);
        return {
            taskFolder: thisUtil.taskFolder,
            reportFolder: thisUtil.reportFolder,
            taskId: thisUtil.taskId
        }
    },
    savePathMap: (fmap)=>{
        let filepath = pathutil.resolve(thisUtil.taskFolder, `./fmap`);
        fs.writeFileSync(filepath, JSON.stringify(fmap))
        filepath = pathutil.resolve(thisUtil.reportFolder, `./fmap`);
        fs.writeFileSync(filepath, JSON.stringify(fmap))
        let rptmap = [];
        for(let key in fmap){rptmap.push(fmap[key]);}
        rptmap = _.sortBy(rptmap, 'lineNum').reverse();
        filepath = pathutil.resolve(thisUtil.taskFolder, `./frpt`);
        fs.writeFileSync(filepath, JSON.stringify(rptmap))
        filepath = pathutil.resolve(thisUtil.reportFolder, `./frpt`);
        fs.writeFileSync(filepath, JSON.stringify(rptmap))
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
        thisUtil.fmap = fmap;
        return fmap;
    },
    loadTask:(taskname)=>{
        //console.log('load:', taskname)
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
        let arr = [];
        report.forEach((o)=>{
            arr.push(`${o.a}:${o.b}=${o.l}`)
        })
        let str = arr.join(',');
        fs.writeFileSync(filepath, str)
    },
    beforePopTask: ()=>{
        let currentTaskStack = [];
        thisUtil.eachTasksFile((taskinfo)=>{
            currentTaskStack.push(taskinfo.taskname);
        });
        return currentTaskStack;
        //console.log(currentTaskStack.length)
    },
    // popTask: ()=>{
    //     let taskname = thisUtil.currentTaskStack.shift();
    //     if(!taskname) return null;
    //     let o = thisUtil.loadTask(taskname);
    //     return o;
    // },
    eachTasksFile: (callback)=>{
        let fmap = thisUtil.loadFileMap();
        let dir = thisUtil.taskFolder;
        var list = fs.readdirSync(dir)
        let tasksList = []
        list.forEach(function(file) {
            file = dir + '/' + file
            let pathinfo = pathutil.parse(file)
            let filename = pathinfo.name;
            var stat = fs.statSync(file)
            if (stat && !stat.isDirectory() && /^task/.test(filename)) {
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
        thisUtil.eachTasksFile((info)=>{            
            count+=info.task.length;
        })
        if(count !== shouldPairSize){
            console.log('verify failed, '+count+ '!='+ shouldPairSize)
        }
        return count === shouldPairSize;
    }
}
module.exports = thisUtil;