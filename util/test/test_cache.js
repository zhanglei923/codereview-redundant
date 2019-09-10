
var blueimp_md5 = require("blueimp-md5")//https://github.com/blueimp/JavaScript-MD5
let cacheUtil = require('../cacheUtil');


for(let i=0;i<100;i++){
    let hash1 = blueimp_md5(Math.random());
    let hash2 = blueimp_md5(i+Math.random());
    let l1l2 = cacheUtil.getL1L2(`${hash1}-${hash2}`);
    console.log(l1l2)

}


