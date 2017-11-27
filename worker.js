var Crawler = require("crawler");
var Agent = require('socks5-http-client/lib/Agent');
var redis = require("redis");
var task_sub = redis.createClient(), task_pub = redis.createClient();
var TASK_CHANNEL = 'crawler:task';
var PROXY_CHANNEL = 'crwaler:proxy';
// var options = {}
// options.agentClass =  Agent;
// options.agentOptions = {
//     socksHost: '127.0.0.1',
//     socksPort: 30000
// };
var worker = new Crawler({
    rateLimit: 300,
    callback : function (error, res, done) {
        if(error){
            //将代理返回到代理队列中
            var options = res.options;
            var proxy = 
            task_pub.publish(PROXY_CHANNEL,options.);
            //将任务返回到任务队列中

        }else{
            //执行逻辑
            //拉去下一个任务
            task_sub.subscribe(TASK_CHANNEL);
        }
        //写日志
        done();
    }
});


task_sub.on("message", function (channel, message) {
    console.log("sub channel " + channel + ": " + message);
    msg_count += 1;
    if (msg_count === 3) {
        sub.unsubscribe();
        sub.quit();
        pub.quit();
    }
});










