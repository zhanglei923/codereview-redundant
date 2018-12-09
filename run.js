var fs = require('fs');
var pathutil = require('path');
var _ = require('lodash');
var minimist = require('minimist');

let reviewer = require('./codereview/reviewer')
let filter_rkweb = require('./codereview/filters/filter-rk-web')

//test:
//> node main --src D:/workspaces/codereview-redundant-test/source/oa/js/approval
//> node main.js --src E:/workspaceGerrit/_sub_branches/apps-ingage-web/src/main/webapp/static/source
let reportPath = pathutil.resolve(__dirname,'../codereview-redundant-report/')
if (!fs.existsSync(reportPath)){fs.mkdirSync(reportPath)}
if (!fs.existsSync('./.report')){fs.mkdirSync('./.report')}

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
let report = reviewer.check(codePath, {
                                        regexs: [/.js$/, /.tpl$/],
                                        functions: filterFuns
                                    });
console.log('cost', new Date() - t0)

fs.writeFileSync('./debuginfo/report.json', JSON.stringify(report))
fs.writeFileSync(pathutil.resolve(reportPath, './report.json'), JSON.stringify(report))