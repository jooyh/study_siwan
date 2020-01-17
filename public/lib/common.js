function transaction(data,option){
    $.ajax({
         url  : option.url
        ,type : option.type ? option.type : 'POST'
        ,data : data
        ,timeout:100000
        ,success : function(result){
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

function gfn_fileTransaction(data,option){
    $.ajax({ 
        url: option.url
        , data: formData
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