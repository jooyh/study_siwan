const express = require('express');
const router = express.Router();
const async = require("async");
const connection = require('../lib/db.js');
const code = require('../lib/code.js');

router.post('/getChatRoomList.do', function(req,res){
    connection.execQuery(
        `
        select jr.user_id
             , jr.room_id
             , jr.alram
             , jr.reg_id
             , jr.upd_id
             , jr.reg_dtm
             , jr.upd_dtm
             , (
                select msg.msg
                from zoz7184.nb_chat_msg msg
                where msg.room_id = jr.room_id
                order by msg.reg_dtm DESC
                LIMIT 1
               ) AS last_msg
          from zoz7184.nb_chat_join_room jr
         where jr.user_id = ?
           and jr.use_yn = 1
        `,
        [req.session.user.user_id]
        ,function(err,results){
            if(err){
                res.send(code.resResultObj("ERR_01",err));
                throw err;
            }
            res.send(code.resResultObj("SUCC_01",results));
        }
    );
});

router.post('/getChatRoom.do', function(req,res){
    console.log("/getChatRoom.do",req.body)
    connection.execQuery(
        `
        select msg.room_id
             , msg.chat_content
             , msg.read_cnt
             , msg.reg_id
             , msg.upd_id
             , msg.reg_dtm
             , msg.upd_dtm
             , usr.user_name
             , usr.user_email
             , usr.user_id
          from zoz7184.nb_chat_msg msg
             , zoz7184.nb_user usr
         where msg.user_id = usr.user_id
           and msg.room_id = ?
           and msg.use_yn = 1
         order by reg_dtm desc
        `,
        [req.body.roomInfo.room_id]
        ,function(err,results){
            if(err){
                res.send(code.resResultObj("ERR_01",err));
                throw err;
            }
            res.send(code.resResultObj("SUCC_01",results));
        }
    );
});


/***************************** functions **********************************/
function insertChatJoinRoom(roomInfo,asyncCb){
    console.log("insertChatJoinRoom >",roomInfo)
    async.forEachOfLimit(roomInfo.userList, 1, function(user, index, cb) {
        connection.execQuery(
            `
                insert into zoz7184.nb_chat_join_room 
                (
                    room_id
                  , alram
                  , user_id
                  , reg_id
                  , upd_id
                  , reg_dtm
                  , upd_dtm
                )values(
                   ?
                  ,?
                  ,?
                  ,?
                  ,?
                  ,now()
                  ,now()
                )
            `
            ,[ roomInfo.room_id
             ,roomInfo.alram
             ,user.user_id
             ,user.user_id
             ,user.user_id
            ]
            ,function(err,results){
                if(err) throw err;
                cb();
            }
        );
    },function eachEnd(err){
        if(err) throw err;
        asyncCb(null,roomInfo);
    });
}

function createChatRoom(roomInfo,asyncCb,callback){
    console.log("createChatRoom  >",roomInfo)
    connection.execQuery(
        `
            insert into zoz7184.nb_chat_room 
            (
                room_id
              , room_name
              , reg_id
              , upd_id
              , reg_dtm
              , upd_dtm
            )values(
               ?
              ,?
              ,?
              ,?
              ,now()
              ,now()
            )
        `
        ,[ roomInfo.room_id
         ,roomInfo.room_name
         ,roomInfo.userList[0].user_id
         ,roomInfo.userList[0].user_id
        ]
        ,function(err,results){
            if(err){
                throw err;
            }
            callback(roomInfo,asyncCb);
        }
    );
}

function selectChatRoom(roomInfo,asyncCb,callback){
    console.log("selectChatRoom",roomInfo);
    connection.execQuery(
        `
            select count(*) as cnt
              from zoz7184.nb_chat_room 
             where room_id = ?
        `
        ,[ roomInfo.room_id ]
        ,function(err,results){
            if(err){
                throw err;
            }
            callback(results[0].cnt,asyncCb);
        }
    );
}

var chatFncs = {
    joinChatRoom : function(roomInfo,cb){
        try {
            async.waterfall(
                [
                    function task1(callback) { 
                        console.log("task1 >",roomInfo)
                        selectChatRoom(roomInfo,callback,function(cnt){
                            console.log("selectChatRoom .. RESULT >>" , cnt);
                            if(cnt != 0){ // 기존 방 있음 ( join )
                                callback(null,roomInfo);
                            }else{ // 기존방 없음 ( create )
                                createChatRoom(roomInfo,callback,function(roomInfo,callback){
                                    insertChatJoinRoom(roomInfo,callback);
                                });
                            }
                        });
                    },
                    function final(roomInfo) { 
                        cb(roomInfo);
                    }
                ]
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    sendMsg : function(msgInfo){
        connection.execQuery(
            `
                insert into zoz7184.nb_chat_msg 
                (
                    room_id
                    , msg
                    , read_cnt
                    , user_id
                    , reg_id
                    , upd_id
                    , reg_dtm
                    , upd_dtm
                )values(
                    ?
                    ,?
                    ,?
                    ,?
                    ,?
                    ,?
                    ,now()
                    ,now()
                )
            `
            ,[   msgInfo.room_id
                ,msgInfo.msg
                ,msgInfo.read_cnt
                ,msgInfo.user_id
                ,msgInfo.user_id
                ,msgInfo.user_id
            ]
            ,function(err,results){
                if(err){
                    res.send(code.resResultObj("ERR_02",err));
                    throw err;
                }
                res.send(code.resResultObj("SUCC_02",results));
            }
        );
    }

}

router.chatFncs = chatFncs;
module.exports = router;