var spawn = require('child_process').spawn; 
var exec = require('child_process').exec; 
var fs = require("fs");
var redis = require("redis");
var sub = redis.createClient(), pub = redis.createClient();
var PORT = 30000;
var PROXY_CHANNEL = 'crwaler:proxy';

function createProxyList(list){

    for(var i = 0;i<list.length;i++){
        (function(i){
            createProxy(list[i][1],list[i][2],list[i][3],list[i][4],PORT+i,function(){
                sub.publish(PROXY_CHANNEL,'127.0.0.1:' + (PORT+i))
            })
        })(i);
        
    }

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

    
    var out = fs.openSync('./out.log', 'a');
    var err = fs.openSync('./out.log', 'a');
    var subprocess = spawn('ss-local', c, {
        detached: true,
        stdio: [ 'ignore', out, err ]
      });

      subprocess.unref();
      subprocess.on('error', (err) => {
        console.log('Failed to start subprocess.');
      });
      subprocess.on('close', (code) => {
        
        console.log(`ps process exited with code ${code}`);
        
        
      });
}

function getFreeSS(){
    var cmd = 'curl https://free-ss.site/ss.php?_=' + +(new Date);
    var list = [];
    exec(cmd, function(err,stdout,stderr){
        if(err) {
            console.log('get api error:'+stderr);
        } else {
            var data = JSON.parse(stdout);
            list = data.data;
            createProxyList(list)
        }
    });
}

module.exports = getFreeSS;