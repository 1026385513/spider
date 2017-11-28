var spawn = require('child_process').spawn; 
var exec = require('child_process').execSync; 
var fs = require("fs");
var Promise = require('es6-promise').Promise;
var redis = require("redis");
var sub = redis.createClient(), pub = redis.createClient();
var PORT = 30000;
var proxy_handles = [];


function createProxyList(list){

    for(var i = 0;i<list.length;i++){
        proxy_handles.push(createProxy(list[i][1],list[i][2],list[i][3],list[i][4],PORT+i))
    }

    return proxy_handles;

}

function createProxy(s,p,k,m,l,callback){
    var c = []
    c.push('-s');
    c.push(s);
    c.push('-p');
    c.push(p);
    c.push('-k');
    c.push(k);
    c.push('-m');
    c.push(m);
    c.push('-l');
    c.push(l);

    var promise = new Promise((resolve, reject) => {

        var out = fs.openSync('./out.log', 'a');
        var err = fs.openSync('./out.log', 'a');
        var subprocess = spawn('ss-local', c, {
            detached: true,
            stdio: [ 'ignore', out, err ]
          });
          
          subprocess.unref();
          subprocess.on('error', (err) => {
            console.log('Failed to start subprocess.');
            resolve({
                handle:subprocess,
                uri:null
            })
          });
          
        //   subprocess.stdout.on('data', (data) => {
        //     console.log(`stdout: proxy`);
            
        //   });
        // todo 错误处理等
        resolve({
            handle:subprocess,
            uri:s + ':' + l
        })
        
      });
    

      return promise
}

function getFreeSS(){
    var cmd = 'curl https://free-ss.site/ss.php?_=' + +(new Date);
    var list = [];

    var stdout = exec(cmd);
    var data = JSON.parse(stdout);
    list = data.data;
    return createProxyList(list.slice(0,1));
}

module.exports = getFreeSS;