var http = require('http');
var fs = require('fs');
var url = require('url');
var template = require('./lib/template.js');

// 서버 생성
var app = http.createServer(function(request,response){
    // 요청 url
    var _url = request.url;
    // 쿼리파라미터
    // var queryData = url.parse(_url, true).query;
    // 경로
    var pathname = url.parse(_url, true).pathname;
    // if(pathname === '/'){
        // 쿼리파라미터가 없는경우
        // if(queryData.id === undefined) queryData.id = "main";

    if(pathname == "/") pathname = "main";
    fs.readdir('./html', function(error, filelist){
        fs.readFile(`./html/${pathname}.html`, 'utf8', function(err, content){
            var html = template.getHtml(content);
            response.writeHead(200);
            response.end(html);
        });
    });
    // }
});
//서버 실행 (3000 포트)....
app.listen(3000);