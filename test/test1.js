var fs = require('fs');
let _ = require('lodash')
let compare = require('../codereview/compare')

// let src2 = fs.readFileSync('../testdata/data_a1.js','utf8')
// let src2 = fs.readFileSync('../testdata/data_b1.js','utf8')

let src1 = fs.readFileSync('../testdata/data_a.js','utf8')
let src2 = fs.readFileSync('../testdata/data_b.js','utf8')

let source1 = compare.cleanCode(src1)
let source2 = compare.cleanCode(src2)

console.log(source1)

let linenum = compare.getRedundantLine(source1, source2, true);

console.log(linenum)
let allsame = fs.readFileSync('../testdatarpt/allsame.js', 'utf8')
let arr = allsame.split('\n')
let ok = true;
arr.forEach((line)=>{
    line = _.trim(line)
    //console.log(line)
    if(src1.indexOf(line)<0 || src2.indexOf(line)<0){
        //console.log(line)
        ok=false;
    }
})
console.log(ok)