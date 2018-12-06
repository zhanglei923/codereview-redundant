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
reviewer.check(codePath, [/.js$/])