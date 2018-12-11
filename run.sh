# run.sh  D:/workspaces/codereview-redundant-mock/source/oa/js/approval

echo $1
node task_gen --src $1
node --max-old-space-size=12288 task_run --src $1