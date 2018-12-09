module.exports = (fpath)=>{
    if(/\/lib\//g.test(fpath)) {
        //console.log(1, fpath);
        return false;
    }else if(/\/oldcrm\//g.test(fpath)) {
        //console.log(2, fpath);
        return false;
    }else if(/\/i18n\//g.test(fpath)) {
        //console.log(2, fpath);
        return false;
    }else if(/\.bundle\./g.test(fpath)) {
        //console.log(3, fpath);
        return false;
    }else if(/\.min\./g.test(fpath)) {
        //console.log(4, fpath);
        return false;
    }else if(/\/default_cn/g.test(fpath)) {
        //console.log(5, fpath);
        return false;
    }else if(/\/province_data/g.test(fpath)) {
        //console.log(6, fpath);
        return false;
    }else if(/\-sdk\-/g.test(fpath)) {
        //console.log(8, fpath);
        return false;
    }else if(/business\-widgets/g.test(fpath)) {
        //console.log(8, fpath);
        //return false;
    }      
    //if(/Ctrl\.js$/g.test(fpath)) {console.log(1, fpath);
    return true;
}