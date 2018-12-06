var fs = require('fs');
var pathutil = require('path');
var _ = require('lodash');
var minimist = require('minimist');

let reviewer = require('./codereview/reviewer')

//test:
//> node main --src D:/workspaces/codereview-redundant-test/source/oa/js/approval

let dataPath = pathutil.resolve(__dirname,'../codereview-redundant-data/')
if (!fs.existsSync(dataPath)){fs.mkdirSync(dataPath)}

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
filterFuns.push((fpath)=>{
    if(/lib/g.test(fpath)) return false;
    if(/i18n/g.test(fpath)) return false;
    if(/\.bundle\./g.test(fpath)) return false;
    if(/\.min\./g.test(fpath)) return false;
    if(/default_cn/g.test(fpath)) return false;
    if(/province_data/g.test(fpath)) return false;
    if(/\-sdk\-/g.test(fpath)) return false;
})


let t0 = new Date()
let report = reviewer.check(codePath, [/.js$/], filterFuns)
console.log('cost', new Date() - t0)
fs.writeFileSync('./debuginfo/report.json', JSON.stringify(report))