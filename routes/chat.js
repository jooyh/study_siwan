const express = require('express');
const router = express.Router();
const connection = require('../lib/db.js');

router.post('/getChatRoomList.do', function(req,res){
    connection.execQuery(
        `
        select r.room_id
             , r.user_list
             , r.reg_dtm
             , (select chat_content 
                  from zoz7184.nb_chat_content c
                 where c.room_id = r.room_id
                 order by r.reg_dtm desc
                 LIMIT 1 ) AS last_chat
          from zoz7184.nb_chat_room r
         where r.user_list like '%'|| ? ||'%'
         order by r.reg_dtm desc;
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


module.exports = router;