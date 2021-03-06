const express = require('express');
const router = express.Router();
const async = require("async");
const connection = require('../lib/db.js');
const code = require('../lib/code.js');

router.post('/getChatRoomList.do', function(req,res){
    connection.execQuery(
        `
        select jr.room_id
            , jr.alram
            , jr.reg_id
            , jr.upd_id
            , jr.reg_dtm
            , jr.upd_dtm
            , group_concat(usr.user_name) as user_names
            , (
            select msg 
                from zoz7184.NB_CHAT_MSG m
                where room_id = jr.room_id 
                order by reg_dtm DESC 
                LIMIT 1
            ) as lst_msg
            , (
            select reg_dtm 
                from zoz7184.NB_CHAT_MSG m
                where room_id = jr.room_id 
                order by reg_dtm DESC 
                LIMIT 1
            ) as lst_dtm
        from zoz7184.NB_USER usr
            , zoz7184.NB_CHAT_JOIN_ROOM jr
        WHERE jr.user_id = usr.user_id
        and jr.room_id in (
                                select room_id
                                from zoz7184.NB_CHAT_JOIN_ROOM
                                where user_id = ?
                            )
        and jr.use_yn = 1
        and usr.user_id != ?
        GROUP by jr.room_id
        `,
        [req.session.user.user_id
        ,req.session.user.user_id]
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
function insertChatJoinRoom(roomInfo,callback){
    async.forEachOfLimit(roomInfo.userList, 1, function(user, index, cb) {
        connection.execQuery(
            `
                insert into zoz7184.NB_CHAT_JOIN_ROOM 
                (
                    room_id
                  , alram
                  , user_id
                  , reg_id
                  , upd_id
                  , reg_dtm
                  , upd_dtm
                )values(p
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
        callback(roomInfo);
    });
}

function insertChatRoom(roomInfo,callback){
    connection.execQuery(
        `
            insert into zoz7184.NB_CHAT_ROOM 
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
            callback(roomInfo);
        }
    );
}

function selectChatRoom(roomInfo,callback){
    connection.execQuery(
        `
            select count(*) as cnt
              from zoz7184.NB_CHAT_ROOM 
             where room_id = ?
        `
        ,[ roomInfo.room_id ]
        ,function(err,results){
            if(err){
                throw err;
            }
            callback(results[0].cnt);
        }
    );
}

//채팅방 상세조회
function selectChatRoomDtl(roomInfo,cb){
    connection.execQuery(
        `
        select msg.room_id
             , msg.msg
             , msg.read_cnt
             , msg.reg_id
             , msg.upd_id
             , msg.reg_dtm
             , msg.upd_dtm
             , usr.user_name
             , usr.user_email
             , usr.user_id
          from zoz7184.NB_CHAT_MSG msg
             , zoz7184.NB_USER usr
         where msg.user_id = usr.user_id
           and msg.room_id = ?
           and msg.use_yn = 1
         order by reg_dtm desc
        `,
        [roomInfo.room_id]
        ,function(err,results){
            if(err) throw err;
            cb(results);
        }
    );
}

function insertChatMsg(msgInfo,cb){
    connection.execQuery(
        `
            insert into zoz7184.NB_CHAT_MSG 
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
            if(err) throw err
            cb(results.insertId);
        }
    );
}

function selectChatMsg(msgId,cb){
    connection.execQuery(
        `select m.chat_id
            , m.room_id
            , m.msg
            , m.file_id
            , m.read_cnt
            , m.reg_dtm
            , u.user_name
        from zoz7184.NB_CHAT_MSG m
            , zoz7184.NB_USER u
        where m.user_id = u.user_id
        and m.chat_id = ?`
        ,[msgId]
        ,function(err,results){
            if(err) throw err
            cb(results);
        }
    )
}

var chatFncs = {
    //채팅방 초대
    invateChatRoom : function(roomInfo,cb){
        insertChatJoinRoom(roomInfo,function(){
            cb(roomInfo);
        });
    },
    //채팅방 생성
    createChatRoom : function(roomInfo,cb){
        insertChatRoom(roomInfo,function(roomInfo){
            insertChatJoinRoom(roomInfo,function(roomInfo){
                cb(roomInfo);
            });
        });
    },
    //채팅방 입장
    enterChatRoom : function(roomInfo,cb){
        selectChatRoomDtl(roomInfo,function(roomDtlInfo){
            cb(roomDtlInfo);
        })
    },
    //메세지 전송
    sendMsg : function(msgInfo,cb){
        insertChatMsg(msgInfo,function(results){
            selectChatMsg(results,function(results){
                cb(results[0]);
            })
        })
    }
}

router.chatFncs = chatFncs;
module.exports = router;