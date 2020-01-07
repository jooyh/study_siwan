// 템플릿 모듈
module.exports = {
    //html layout
    HTML:function(contents){
        var gnb = ``;
        var footer = ``;
        var header = ``;
        var menu = ``;
        var title = ``;
        var css = ``;

        var html = `
        <!doctype html>
        <html>
        <head> 
        <title>WEB - ${title}</title>
        <meta charset="utf-8">
        </head>
        <body>
        <h1><a href="/">WEB</a></h1>
        ${contents.content}
        </body>
        </html>
        `;
        return html;
    },
    //html data 
    getHtml : function(content){
        return this.HTML({content:content});
    }
}