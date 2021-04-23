// sh run.sh ./test/test_config_SeisPrj_full-bundle.js

{
    //"targetFolder": "/Users/zhanglei/workspaces/apps-ingage-web/src/main/webapp/static/source/oa/js/approval",
    //"targetFolder": "/Users/zhanglei/workspaces/apps-ingage-web/src/main/webapp/static/source/oa/",
    "targetFolder": "D:/workspacesSeismic/web-full-bundle-assets/src",
    "cacheFolder": "D:/workspacesZL/codereview-redundant-cache",
    //"cacheFolder": null,
    //"cacheFolder": "/Volumes/ssd01/codereview-redundant-cache/",
    "filetypes": ["js"],
    "acceptFileFilter": (fpath)=>{
        if(    /\/lib\//g.test(fpath)
            || /\/oldcrm\//g.test(fpath)
            || /\/i18n\//g.test(fpath)
            || /\.bundle\./g.test(fpath)
            || /\.min\./g.test(fpath)
            || /\/default_cn/g.test(fpath)
            || /\/province_data/g.test(fpath)
            || /\-sdk\-/g.test(fpath)
            || /node_modules/g.test(fpath)
            || /styleSetConfig\.js$/.test(fpath)
            || /dataSetConfig\.js$/.test(fpath)
            
        ) {
            return false;
        }
        //if(/Ctrl\.js$/g.test(fpath)) {console.log(1, fpath);
        return true;
    }
}