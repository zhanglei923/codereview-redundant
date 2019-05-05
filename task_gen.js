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

let reportsPath = pathutil.resolve(__dirname,'../codereview-redundant-reports/')
let tasksPath = pathutil.resolve(__dirname,'../codereview-redundant-tasks/')
//if (!fs.existsSync(reportsPath)){fs.mkdirSync(reportsPath)}
if (!fs.existsSync(tasksPath)){fs.mkdirSync(tasksPath)}
if (!fs.existsSync('./.reports')){fs.mkdirSync('./.reports')}
multiTaskUtil.init(tasksPath)

var terminalOps = minimist(process.argv.slice(2), {});
console.log(terminalOps)
let fileConfigPath = terminalOps.configfile;
let configPath = pathutil.resolve(__dirname, fileConfigPath);
if(!fs.existsSync(configPath)){
    console.log('file not exist:', configPath)
    return;
}
let configTxt = fs.readFileSync(configPath, 'utf8')
let config = {};
eval(`config=${configTxt}`)
let codePath = config.targetFolder;
codePath = pathutil.resolve(__dirname, codePath)

if (!fs.existsSync(codePath)) {
    throw 'Path not exist: '+codePath
}
let fileExts = [/.js$/]
if(config.filetypes){
    fileExts = [];
    config.filetypes.forEach((type)=>{
        if(typeof type === 'string'){
            type = new RegExp('\.'+type+'$');
        }
        fileExts.push(type);
    })
}
console.log('codePath', codePath)
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