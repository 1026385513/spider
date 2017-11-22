var Crawler = require("crawler");
var fs = require("fs");
var index_pages = [];// index page
var list_pages = [];//list page
var detail_pages = []; // detail page
var PAGE_SYMBAL = '.pageList';
var INDEX_URL = 'http://www.cn357.com/notice_';
var ITEM_SYMBAL = '.noticeLotItem a'
var last_index = 2;

// 提取列表中的页数

function getPageSize($){
    var pagenation = $(PAGE_SYMBAL);
    if (!pagenation) return 0;
    var children = pagenation.children();
    var size = 0;
    children.each(function(i,item){
        var num = +$(this).text() || 0;
        size = num > size ? num : size;
    })

    return size;
    
}

//抓去列表链接
var c = new Crawler({
    rateLimit: 200,
    maxConnections : 10,
    
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;

            var size = getPageSize($);

            var list_urls = getListUrls(INDEX_URL + last_index + '_',1,size);

            list_pages = list_pages.concat(list_urls)
            
        }
        last_index++;
        console.log(last_index+' done!')
        done();
    }
});

//抓去详情链接
var d = new Crawler({
    rateLimit: 200,
    maxConnections : 10,
   
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            var urls = getUrlsFromBody($);
            detail_pages = detail_pages.concat(urls);
        }
        console.log('page done!')
        done();
    }
});


//从列表中提取url
function getUrlsFromBody($){
    var items = $(ITEM_SYMBAL);
    var urls = [];
    items.each(function(i,item){
        urls.push($(this).attr('href') || '')
    })
    return urls;
}


c.on('drain',function(){
    fs.writeFileSync("index_pages.json", JSON.stringify(index_pages));
    fs.writeFileSync("list_pages.json", JSON.stringify(list_pages));
    d.queue(list_pages);
    
});
d.on('drain',function(){
    fs.writeFileSync("detail_pages.json", JSON.stringify(detail_pages));
});


function getListUrls(url,startPage,endPage){
    //
    var urls = [];
    for(var i=startPage;i<=endPage;i++){
        urls.push(url+i)
    }

    return urls;
}


function run(){
    index_pages = getListUrls(INDEX_URL,2,300);
    //获取所有列表页
    //c.queue(index_pages);

    list_pages = JSON.parse(fs.readFileSync('list_pages.json'));

    d.queue(list_pages);
    
}

run();








