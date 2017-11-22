var spawn = require('child_process').spawn; 
var exec = require('child_process').exec; 
var fs = require("fs");
var cmd = 'curl https://free-ss.site/ss.php?_=' + +(new Date);
var list = [];

var port = 30000;

var data = [];


exec(cmd, function(err,stdout,stderr){
    if(err) {
        console.log('get api error:'+stderr);
    } else {
        var data = JSON.parse(stdout);
        list = data.data;
        createProxyList(list)
    }
});


function createProxyList(list){console.log('总数' + list.length);

    for(var i = 0;i<list.length;i++){
        (function(i){
            createProxy(list[i][1],list[i][2],list[i][3],list[i][4],port+i,function(){
                data.push('http://127.0.0.1:' + (port+i) );
                fs.writeFileSync('./proxy.json',JSON.stringify(data))
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
    
    //c = c.join(' ')
    // exec(c, function(err,stdout,stderr){
    //     if(err) {
    //         console.log('create proxy error:'+stderr);
    //     } else {
    //         console.log('create '+s)
    //         callback(stdout)
    //     }
    // });
    
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