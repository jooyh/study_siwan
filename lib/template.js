// 템플릿 모듈
module.exports = {
    //html layout
    
    HTML:function(contents){
        
        var gnb = ``;
        var footer = ``;
        var header = ``;
        var menu = ``;
        var title = ``;
        var css = `
            <link rel="stylesheet" type="text/css" href="/resources/style.css">
            <link rel="stylesheet" type="text/css" href="/resources/layout.css">
            <link rel="stylesheet" type="text/css" href="/resources/ygmSlide.css">
        `;

        var html = `
        <!doctype html>
        <html>
        <head> 
        <title>WEB - ${title}</title>
        <meta charset="utf-8">
        ${css}
        </head>
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

    // getResources : function(){
    //     var fs = require('fs');
    //     var resourcesHtml = ``;
    //     fs.readdir('./resources', function(error, fileList){
    //         for(var i in fileList){
    //             if(fileList[i].search("css") != -1){
    //                 resourcesHtml += `<link rel="stylesheet" type="text/css" href="css/resources/${fileList[i]}"> `
    //             }
    //         }
    //     });
    // }
}