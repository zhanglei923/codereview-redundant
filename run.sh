# sh ./run.sh  D:/workspaces/source-201812/source/oa/js/approval
# sh ./run.sh  D:/workspaces/source-201812/source/designer
echo $1
node task_gen --src $1
node --max-old-space-size=5120 task_run --src $1