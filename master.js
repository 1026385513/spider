var createProxy = require('./proxy.js')

function createWorkers(){

}
function main(){
    //todo 异步 一次创建全部还是一个
    createProxy();

    //todo 依次创建
    createWorkers();


}

//进度条