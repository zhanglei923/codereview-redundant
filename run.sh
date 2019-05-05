# sh ./run.sh ./test/test_config.json

echo $1
node task_gen --configfile $1
sleep 3s
node --max-old-space-size=5120 task_run