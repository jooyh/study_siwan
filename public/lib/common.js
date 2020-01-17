function transaction(param,option){
    $.ajax({
         url  : option.url
        ,type : option.type ? option.type : 'POST'
        ,data : param ? param : {}
        ,timeout:100000
        ,success : function(result){
            console.log(option.url , result);
            if(result.code.search("SUCC") != -1){
                if(option.success) option.success(result.data);
            }else{
                if(result.msg){
                    alert(result.msg+` (${result.code})`);
                }
            }
        }
        ,error : function(e){
            alert("시스템 오류가 발생했습니다.");
        }
        ,beforeSend:function(){
        }
        ,complete:function(){
        }
    });
}

function gfn_fileTransaction(param,option){
    $.ajax({ 
        url: option.url
        , data: param
        , enctype: 'multipart/form-data'
        , processData: false
        , contentType: false
        , type: 'POST'
        , success: function(result){ 
            console.log(url , result);
            if(result.code.search("SUCC") != -1){
                option.success(result.data);
            }else{
                if(result.msg){
                    alert(result.msg+` (${result.code})`);
                }
            }
        } 
        ,error : function(e){
            alert("시스템 오류가 발생했습니다.");
        }
        ,beforeSend:function(){
        }
        ,complete:function(){
        }
    });
}

function testFollow(){
    var param = {email : "aguitarj@naver.com"}
    transaction(param,{
        url : "/account/reqFollow.do"
        ,success : function(result){
            alert("팔로우 등록");
        }
    });
}

function testUnFollow(){
    var param = {email : "aguitarj@naver.com"}
    transaction(param,{
        url : "/account/unFollow.do"
        ,success : function(result){
            alert("언팔로우");
        }
    });
}

function testLike(){
    var param = {postId : 60}
    transaction(param,{
        url : "/post/likePost.do"
        ,success : function(result){
            console.log(result);
        }
    });
}

function testSelectUserPost(){
    var param = {email : "aguitarj@naver.com" , start:0 , unit : 5};

    transaction(param,{
        url : "/account/getUserInfo.do"
    })
    transaction(param,{
        url : "/post/selectUserPost.do"
    })
}
