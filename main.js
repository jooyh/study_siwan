var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/common/template.js');
var join = require('./lib/common/join.js');

//pm2 사용시 서버 실행 명령어 
//pm2 start main.js --watch

// 서버 생성
var app = http.createServer(function(request,response){
    // 요청 url
    var _url = request.url;
    // 쿼리파라미터
    // var queryData = url.parse(_url, true).query;
    // 경로
    var pathname = url.parse(_url, true).pathname;

    if(pathname == "/") pathname = "main";

    //resource 요청의 경우
    if(_url.search("resources") != -1){
        fs.readFile(`.${pathname}`,`utf8`,function(err,resource){
            response.writeHead(200);
            response.end(resource);
        });
    // 그외 페이지 요청의 경우
    }else{
        if(pathname == "join"){
            var test = '';
            request.on('data', function(data){
                console.log('start',data);
                test += data;
            });
            request.on('end',function(){
                var temp = null;
                if(test){
                    temp = qs.parse(test);
                    console.log(temp);
    
                    fs.writeFile(`data/${temp.email.split("@")[0]}`,JSON.stringify(temp),"utf8",function(err){
                        console.log(err);
                    });
                }
            });
        }

        fs.readFile(`./html/${pathname}.html`, 'utf8', function(err, content){
            var html = template.getHtml(content);
            response.writeHead(200);
            response.end(html); 
        });
    }
});
//서버 실행 (3000 포트)....
app.listen(3000);