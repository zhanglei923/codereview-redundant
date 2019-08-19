let su = require('./scriptUtil')
let txt = su.decomment(`
var a=10;
//adsfa
/**
 * asdfadsfads
 * 
 */
 alert(88)

`)
console.log(txt)

