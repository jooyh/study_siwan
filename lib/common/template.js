// 템플릿 모듈
module.exports = {
    //html layout
    
    HTML:function(contents){ 
        
        var gnb = `
            <div>
                <ul>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
            <div>
        `;
        var footer = ``;
        var header = ``;
        var menu = ``;
        var title = ``;
        var resources = 
        `
            <link rel="stylesheet" type="text/css" href="/css/style.css">
            <link rel="stylesheet" type="text/css" href="/css/layout.css">
            <link rel="stylesheet" type="text/css" href="/lib/ygmSlide.css">
            <script src="/lib/ygmSlide.min.js"></script>
        `;

        var html = `
        <!doctype html>
        <html lang="ko">
        <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no">
        <title>WEB${title}</title>
        ${resources} 
        </head>
        <nav>
        </nav>
        <body>
        <div class='contents'>
        ${contents.content}
        <div>
        </body>
        </html>
        `;
        return html;
    },
    //html data 
    getHtml : function(content){
        return this.HTML({content:content});
    },

    getResources : function(){
        var fs = require('fs'); 
        var resourcesHtml = ``;
        fs.readdir('./resources', function(error, fileList){
            for(var i in fileList){
                if(fileList[i].search("css") != -1){
                    resourcesHtml += `<link rel="stylesheet" type="text/css" href="/resources/${fileList[i]}"> `
                }else if(fileList[i].search("js") != -1){
                    resourcesHtml += `<script src="/resources/${fileList[i]}"></script> `
                }
            }
            return resourcesHtml;
        });
    }
}