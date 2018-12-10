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
    saveSubTasks: function(tasks) {
        let filepath = pathutil.resolve(thisUtil.taskFolder, `./tasks${thisUtil.taskCount}`);
        thisUtil.taskCount++;
        fs.writeFileSync(filepath, JSON.stringify(tasks))
    }
}
module.exports = thisUtil;