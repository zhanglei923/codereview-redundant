var fs = require('fs');
var pathutil = require('path');
var _ = require('lodash');
var minimist = require('minimist');
let multiTaskUtil = require('./util/multiTaskUtil')

let generateTasks = require('./codereview/generateTasks')
let runTasks = require('./codereview/runTasks')
let filter_rkweb = require('./codereview/filters/filter-rk-web')

//test:
//> node main --src D:/workspaces/codereview-redundant-test/source/oa/js/approval
//> node main.js --src E:/workspaceGerrit/_sub_branches/apps-ingage-web/src/main/webapp/static/source
let reportsPath = pathutil.resolve(__dirname,'../codereview-redundant-reports/')
let tasksPath = pathutil.resolve(__dirname,'../codereview-redundant-tasks/')
if (!fs.existsSync(reportsPath)){fs.mkdirSync(reportsPath)}
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
let codePath = terminalOps.src;

console.log(codePath)
codePath = pathutil.resolve(__dirname, codePath)

let filterFuns = [];
filterFuns.push(filter_rkweb)


let t0 = new Date()
generateTasks.generate(codePath, {
                            regexs: [/.js$/, /.tpl$/],
                            functions: filterFuns
                        });
runTasks.run(codePath);

// fs.writeFileSync('./.report/report.json', JSON.stringify(report))
// fs.writeFileSync(pathutil.resolve(reportsPath, './report.json'), JSON.stringify(report))