var fs = require('fs');
var pathutil = require('path');
var _ = require('lodash');
var jsdiff = require('diff');
var decomment = require('decomment');
var minimist = require('minimist');

let fileUtil = require('./util/fileUtil')

//test:
//> node main --src D:/workspaces/codereview-redundant-test/source/oa

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

fileUtil.eachContent(codePath, [/\.js$/], (src, fpath)=>{
    console.log(fpath)

})