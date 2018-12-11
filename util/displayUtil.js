var fs = require('fs');
var decomment = require('decomment');
module.exports = {
    percentage: function(num, total) {
        let p = num/total;
        p = Math.round(1000 * p)
        p = p / 10;
        return p;
    }
}