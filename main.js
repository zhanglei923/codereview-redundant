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
    if(/\/lib\//g.test(fpath)) {
        console.log(1, fpath);
        return false;
    }else if(/\/i18n\//g.test(fpath)) {
        console.log(2, fpath);
        return false;
    }else if(/\.bundle\./g.test(fpath)) {
        console.log(3, fpath);
        return false;
    }else if(/\.min\./g.test(fpath)) {
        console.log(4, fpath);
        return false;
    }else if(/\/default_cn/g.test(fpath)) {
        console.log(5, fpath);
        return false;
    }else if(/\/province_data/g.test(fpath)) {
        console.log(6, fpath);
        return false;
    }else if(/\-sdk\-/g.test(fpath)) {
        console.log(8, fpath);
        return false;
    }    
    //if(/Ctrl\.js$/g.test(fpath)) {console.log(1, fpath);
    return true;
})


let t0 = new Date()
let report = reviewer.check(codePath, [/.js$/], filterFuns)
console.log('cost', new Date() - t0)

fs.writeFileSync('./debuginfo/report.json', JSON.stringify(report))
fs.writeFileSync(pathutil.resolve(dataPath, './report.json'), JSON.stringify(report))