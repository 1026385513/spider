var Crawler = require("crawler");
var fs = require("fs");
var ProgressBar = require('progress');
var Agent = require('socks5-http-client/lib/Agent');
var detail_pages = []; // detail page
var BODY_SYMABl = '.noticeAttr tr'; 
var URL_BASE = 'http://www.cn357.com';
var last_index = 0;
var TASK_START = 0;
var TASK_END = 10000;   
var errors = [];

var data = [];

var bar;
//抓去列表链接
var c = new Crawler({
    //rateLimit: 300,
    maxConnections : 32,
    
    callback : function (error, res, done) {
        var url = detail_pages[last_index];
        bar.tick();
        if(error){
            console.log(error);console.log(res.options.agentOptions);
            
            errors.push(url);
            fs.writeFileSync("errors_detail_page.json", JSON.stringify(errors));
        }else{
            var $ = res.$;
            var _data = getBody($);
            data.push(_data);
        }

        if (data.length >= 1000){
            fs.writeFileSync("./data/data" + last_index + ".json", JSON.stringify(data));
            data = [];
        }
        last_index++;
        
        done();
    }
});

function getBody($){
    var list = $(BODY_SYMABl);
    var data = {};
    list.each(function(i,elm){
        var tr = $(this);
        var td = tr.children('td');
        if (td.length != 4) return;
        var field1 = (td.eq(0).text() || '').trim();
        var value1 = (td.eq(1).text() || '').trim();
        var field2 = (td.eq(2).text() || '').trim();
        var value2 = (td.eq(3).text() || '').trim();

        data[field1] = value1;
        data[field2] = value2;
        
    })

    return data;
}





c.on('drain',function(){
    //fs.writeFileSync("errors_detail_page.json", JSON.stringify(errors));
    //fs.writeFileSync("data.json", JSON.stringify(data));
    if (data.length){
        fs.writeFileSync("./data/data" + last_index + ".json", JSON.stringify(data));
    }
    console.log('done! \n')
});

var proxy_list = JSON.parse(fs.readFileSync('proxy.json'));
var proxy_index = 0;
function run(){
    
    last_index = TASK_START;
    
    detail_pages = JSON.parse(fs.readFileSync('detail_pages.json'));
    detail_pages = detail_pages.map(function(item,index){
        return URL_BASE+item;
    })
    detail_pages = detail_pages.slice(TASK_START,TASK_END);

    bar = new ProgressBar('抓取 [:bar] :percent 速度:rate个/秒 剩余时间:etas 总数:total个 当前:current个 已用时:elapsed', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: detail_pages.length
      });
    if (proxy_list.length){
        c.on('schedule',function(options){
            //options.proxy = proxy_list[proxy_index].toLocaleLowerCase();
            options.agentClass =  Agent;
            options.agentOptions = {
                socksHost: '127.0.0.1',
                socksPort: 30000 + proxy_index
            };
            proxy_index++;
            if (proxy_index >= proxy_list.length ){
                proxy_index = 0;
            }
            
        });
    }
    c.queue(detail_pages);
}

run();








