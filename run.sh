# sh ./run.sh  D:/workspaces/source-201812/source/oa/js/approval
# sh ./run.sh  D:/workspaces/source-201812/source/designer
# sh ./run.sh /Users/zhanglei/workspaces/apps-ingage-web/src/main/webapp/static/source
# sh ./run.sh /Users/zhanglei/workspaces/apps-ingage-web/src/main/webapp/static/source/designer
# sh ./run.sh /Users/zhanglei/workspaces/apps-ingage-web/src/main/webapp/static/source/oa/js/approval

#test:
#> sh run.sh D:/workspaces/source-201812/source/oa/js/approval
#> sh run.sh D:/workspaces/source-201812/source/designer?filetypes=js+tpl+aaa+bbb&config=
#> sh run.sh D:/workspaces/source-201812/source/designer?filetypes=js
#> sh run.sh E:/workspaceGerrit/_sub_branches/apps-ingage-web/src/main/webapp/static/source
echo $1
node task_gen --src $1
sleep 3s
node --max-old-space-size=5120 task_run ##--src $1