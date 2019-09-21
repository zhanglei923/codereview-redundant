// sh ./runconfig.sh /Users/zhanglei/workspaces/apps-ingage-web/src/main/webapp/static/source
// sh ./runconfig.sh /Users/zhanglei/workspaces/apps-ingage-web/src/main/webapp/static/source/designer
// sh ./runconfig.sh /Users/zhanglei/workspaces/apps-ingage-web/src/main/webapp/static/source/oa/js/approval

//test:
//> sh runconfig.sh D:/workspaces/source-201812/source/oa/js/approval
//> sh runconfig.sh D:/workspaces/source-201812/source/designer?filetypes=js+tpl+aaa+bbb&config=
//> sh runconfig.sh D:/workspaces/source-201812/source/designer?filetypes=js
//> sh runconfig.sh E:/workspaceGerrit/_sub_branches/apps-ingage-web/src/main/webapp/static/source

{
    //"targetFolder": "/Users/zhanglei/workspaces/apps-ingage-web/src/main/webapp/static/source/oa/js/approval",
    //"targetFolder": "/Users/zhanglei/workspaces/apps-ingage-web/src/main/webapp/static/source/oa/",
    "targetFolder": "/Users/zhanglei/workspaces/apps-ingage-web/src/main/webapp/static/source/",
    "cacheFolder": "/Users/zhanglei/workspaces/apps-ingage-web_cache/",
    //"cacheFolder": null,
    //"cacheFolder": "/Volumes/ssd01/codereview-redundant-cache/",
    "filetypes": ["js","tpl",/\.aaa$/,/\.bbb$/],
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
            
        ) {
            return false;
        }else if(/business\-widgets/g.test(fpath)) {
            //console.log(8, fpath);
            //return false;
        }      
        //if(/Ctrl\.js$/g.test(fpath)) {console.log(1, fpath);
        return true;
    }
}