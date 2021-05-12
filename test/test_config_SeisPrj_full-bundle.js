//  sh run.sh D:/workspacesZL/codereview-redundant/test/test_config_SeisPrj_full-bundle.js

{
    //"targetFolder": "D:/workspacesZL/ng-hunting-data/reponsitories",
    "targetFolder": "D:/workspacesSeismic/web-full-bundle-assets/src",
    "cacheFolder": "D:/workspacesZL/codereview-redundant-cache",
    //"cacheFolder": null,
    //"cacheFolder": "/Volumes/ssd01/codereview-redundant-cache/",
    "filetypes": ["js"],
    "acceptFileFilter": (fpath)=>{
        if(/\/src\//g.test(fpath)){
            if(    /\/lib\//g.test(fpath)
                //|| /\/i18n\//g.test(fpath)
                || /\.bundle\./g.test(fpath)
                || /\.min\./g.test(fpath)
                //|| /\/default_cn/g.test(fpath)
                || /\/dist\//g.test(fpath)
                //|| /\-sdk\-/g.test(fpath)
                || /\/node_modules\//g.test(fpath)
                // || /styleSetConfig\.js$/.test(fpath)
                // || /dataSetConfig\.js$/.test(fpath)
                
            ) {
                return false;
            }else{
                return true;
            }
        }
        
        //if(/Ctrl\.js$/g.test(fpath)) {console.log(1, fpath);
        return false;
    }
}