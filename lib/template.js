// 템플릿 모듈
module.exports = {
    //html layout
    HTML:function(contents){ 
        var gnb, footer, header, menu = null;
        var title = 'NULBO';
        var resources = 
        `
            <link rel="stylesheet" type="text/css" href="/stylesheets/style.css">
            <link rel="stylesheet" type="text/css" href="/stylesheets/login.css">
            <link rel="stylesheet" type="text/css" href="/lib/ygmSlide.css">
            <script type="text/javascript" src="http://code.jquery.com/jquery-latest.min.js"></script>
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
    }
}