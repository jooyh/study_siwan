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
            <script src="/lib/common.js"></script>
        `;

        var html = `
        <!doctype html>
        <html lang="ko">
        <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no">
        <title>${title}</title>
        ${resources} 
        </head>
        <body>
        <div class='container'>
            <header>
                <div class="top-banner">
                    <div class="logo-box">
                        <img src="/images/img_logo.png" alt="개스타그램로고" />
                    </div>
                </div>
            </header> 
            <nav>
                <ul class="bottom-menu">
                    <li><a href="/timeline" class="btn-timeline">타임라인</a></li>
                    <li><a href="/pop_post" class="btn-post">글쓰기</a></li>
                    <li><a href="/userpage" class="btn-mypage">내게시물</a></li>
                    <li><a href="/chat" class="btn-chat">채팅</a></li>
                </ul>
            </nav>
            <section class='contents'>
                ${contents.content}
            </section>
            <section class='popup-container'>
                <div id="chat"></div>
                <div id="chat_user_list"></div>
                <div id="post"></div>
            </section>
        <div>
        <script>
        
        $(document).on("ready",function(){
            $("#post").load("/popup/pop_post.html");
            $("#chat").load("/popup/pop_chat.html");
            $("#chat_user_list").load("/popup/pop_chat_user_list.html");
            fn_pageInit();
        })
        </script>
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