let scriptUtil = require('../scriptUtil');

let ok = scriptUtil.isSameFileType('aa/aa.js', 'bb/bb.js')
console.log(ok)
ok = scriptUtil.isSameFileType('aa/aa.ts', 'bb/bb.js')
console.log(ok)
ok = scriptUtil.isSameFileType('aa/aa', 'bb/bb')
console.log(ok)
ok = scriptUtil.isSameFileType('aa/aa', 'bb/bb.js')
console.log(ok)

let src = scriptUtil.cleanCode(`
//aaa
var a = 1;


`, 'bb/bb.js')
console.log(src)