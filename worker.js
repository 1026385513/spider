var Crawler = require("crawler");
var Agent = require('socks5-http-client/lib/Agent');
var redis = require("redis");
var task_sub = redis.createClient(), task_pub = redis.createClient();
var proxy_sub = redis.createClient(), proxy_pub = redis.createClient();
var TASK_CHANNEL = 'crawler:task';
var PROXY_CHANNEL = 'crwaler:proxy';
var RESULT_CHANNEL = 'crwaler:result';
var options = null;
var RETRY_TIMES = 0;

var worker = new Crawler({
    rateLimit: 300,
    retries:RETRY_TIMES,
    callback : function (error, res, done) {
        if(error){
            //代理无效
           
            //将代理返回到代理队列中
            var options = res.options;
            var proxy = options.socksHost ? options.socksHost + ':' + options.socksPort : options.proxy;
            proxy && proxy_pub.publish(PROXY_CHANNEL,proxy);

            //将任务返回到任务队列中
            task_pub.publish(TASK_CHANNEL,res.uri);
        }else{
            //执行逻辑
            console.log(res.uri)
            task_pub.publish(RESULT_CHANNEL,res.uri + ' result')
        }

        //获取下一个任务
        task_sub.subscribe(TASK_CHANNEL);

        //写日志

        done();
    }
});

function handleProxyMessage(channel, message){
    //获取代理
    if (channel == PROXY_CHANNEL){
        var is_http = /^http/.test(message);
        var parts = message.split(':');
        // 无代理直接返回
        if (!parts.length) return;
        options = {}
        if (is_http){
            options.proxy = message;
        }else{
            options.agentClass =  Agent;
            options.agentOptions = {
                socksHost: parts[0],
                socksPort: parts[1]
            };
        }

        proxy_sub.unsubscribe();
        
    }
}

function handleTaskMessage(channel, message){
    //
    if(channel == TASK_CHANNEL){
        task_sub.unsubscribe();
        worker.queue(Object.assign({
            uri:message
        },options))
    }
}
function main(){
    proxy_sub.subscribe(PROXY_CHANNEL);
    task_sub.subscribe(TASK_CHANNEL);
    proxy_sub.on("message", handleProxyMessage);
    task_sub.on("message", handleTaskMessage);
}

function cleanup(){
    //释放代理
    if (options){
        var proxy = options.proxy || (options.socksHost + ':' + options.socksPort);
        proxy_pub.publish(PROXY_CHANNEL,proxy);
    }
    
}



process.stdin.resume();
process.on('exit', (code) => {
    cleanup();
});

process.on('SIGINT', () => {
    process.exit();
});


main();










