var Promise = require('es6-promise').Promise;
var redis = require("redis");
var spawn = require('child_process').spawn; 
var sub = redis.createClient(), pub = redis.createClient();
var createProxy = require('./proxy.js');

var TASK_CHANNEL = 'crawler:task';
var PROXY_CHANNEL = 'crwaler:proxy';
var RESULT_CHANNEL = 'crwaler:result';

var proxy_pr = [];
var proxy_list = [];
var workers = [];

function createWorker(){
   
    var subprocess = spawn('node',['worker.js'], {
        detached: true,
        stdio: [ 'ignore', 'ignore', 'ignore' ]
        });
    subprocess.unref();
    return subprocess;
}   


function main(){

    proxy_pr = createProxy();
    var proxy_uris = [];
    var proxy_handles = [];
    Promise
    .all(proxy_pr)
    .then(function(list){
        proxy_list = list.filter(function (item,index){
            if (item.uri){
                return true;
            }
        });
        
        proxy_list.map(function(item,index){
            proxy_uris.push(item.uri);
            //proxy_handles.push(tiem.handle);
            pub.publish(PROXY_CHANNEL,item.uri);

            var worker = createWorker();
            workers.push(worker);
            
        })
        
    })

    sub.subscribe(RESULT_CHANNEL);
    sub.on('message',function(channel, message){
        if (channel == RESULT_CHANNEL){
            console.log(message)
        }
    })

}

main();

//进度条