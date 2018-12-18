module.exports = (fpath)=>{
    if(    /\/lib\//g.test(fpath)
        || /\/oldcrm\//g.test(fpath)
        || /\/i18n\//g.test(fpath)
        || /\.bundle\./g.test(fpath)
        || /\.min\./g.test(fpath)
        || /\/default_cn/g.test(fpath)
        || /\/province_data/g.test(fpath)
        || /\-sdk\-/g.test(fpath)
        || /node_modules/g.test(fpath)
    
    ) {
        return false;
    }else if(/business\-widgets/g.test(fpath)) {
        //console.log(8, fpath);
        //return false;
    }      
    //if(/Ctrl\.js$/g.test(fpath)) {console.log(1, fpath);
    return true;
}