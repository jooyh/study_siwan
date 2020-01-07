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
            <link rel="stylesheet" type="text/css" href="/resources/style.css">
            <link rel="stylesheet" type="text/css" href="/resources/layout.css">
            <link rel="stylesheet" type="text/css" href="/resources/ygmSlide.css">
            <script src="/resources/ygmSlide.min.js"></script>
        `;

        var html = `
        <!doctype html>
        <html>
        <head> 
        <title>WEB - ${title}</title>
        <meta charset="utf-8">
        ${resources}
        </head>
        <nav>
        </nav>
        <body>
        <h1><a href="/">WEB</a></h1>
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