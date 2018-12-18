var fs = require('fs');
var pathutil = require('path');
var _ = require('lodash');
var minimist = require('minimist');
const queryString = require('query-string');
let multiTaskUtil = require('./util/multiTaskUtil')
let scriptUtil = require('./util/scriptUtil')
let generateTasks = require('./codereview/generateTasks')
let runTasks = require('./codereview/runTasks')
let filter_rkweb = require('./codereview/filters/filter-rk-web')

//test:
//> sh run.sh D:/workspaces/source-201812/source/oa/js/approval
//> sh run.sh D:/workspaces/source-201812/source/designer?filetypes=js+tpl+aaa+bbb&config=
//> sh run.sh D:/workspaces/source-201812/source/designer?filetypes=js
//> sh run.sh E:/workspaceGerrit/_sub_branches/apps-ingage-web/src/main/webapp/static/source
let reportsPath = pathutil.resolve(__dirname,'../codereview-redundant-reports/')
let tasksPath = pathutil.resolve(__dirname,'../codereview-redundant-tasks/')
//if (!fs.existsSync(reportsPath)){fs.mkdirSync(reportsPath)}
if (!fs.existsSync(tasksPath)){fs.mkdirSync(tasksPath)}
if (!fs.existsSync('./.reports')){fs.mkdirSync('./.reports')}
multiTaskUtil.init(tasksPath)

var cmdOptions = {
    string: 'src',
    default: {
        src: null
    }
};
var terminalOps = minimist(process.argv.slice(2), cmdOptions);
let pathConfigStr = terminalOps.src;

console.log(pathConfigStr)
let codePath = pathConfigStr.split('?')[0]
let configs = pathConfigStr.split('?')[1]

codePath = pathutil.resolve(__dirname, codePath)
console.log('codePath', codePath)

if (!fs.existsSync(codePath)) {
    throw 'Path not exist: '+codePath
}

let fileExts = [/.js$/]
if(configs){
    const parsed = queryString.parse(configs);
    console.log('<parsed>:', parsed)
    let filetypes = parsed.filetypes;
    if(filetypes){
        fileExts = filetypes.split(/\s/)
        for(let i=0;i<fileExts.length;i++){
            fileExts[i] = new RegExp('\.'+fileExts[i]+'$')
        }
    }
}
console.log('fileExts', fileExts)

let filterFuns = [];
filterFuns.push(filter_rkweb)

let t0 = new Date()
let taskId = generateTasks.generate(codePath, {
                            regexs: fileExts,//[/.js$/, /.tpl$/],
                            functions: filterFuns
                        });
let cookiePath = pathutil.resolve(__dirname, './.tmp_info')
fs.writeFileSync(cookiePath, JSON.stringify({tasksPath, taskId}))
//runTasks.run(codePath);
//
// fs.writeFileSync('./.report/report.json', JSON.stringify(report))
// fs.writeFileSync(pathutil.resolve(reportsPath, './report.json'), JSON.stringify(report))