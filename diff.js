var fs = require('fs');
var pathutil = require('path');
var _ = require('lodash');
var minimist = require('minimist');
let compare = require('./codereview/compare')
//test:
//> node main --src D:/workspaces/codereview-redundant-test/source/oa/js/approval
//> node main.js --src E:/workspaceGerrit/_sub_branches/apps-ingage-web/src/main/webapp/static/source


var cmdOptions = {
    string: 'pair',
    default: {
        pair: null
    }
};
var terminalOps = minimist(process.argv.slice(2), cmdOptions);
let pair = terminalOps.pair;

let arr = pair.split(',')
console.log(pair)