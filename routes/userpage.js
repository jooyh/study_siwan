const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const path = require("path");
const connection = require('../lib/db.js');
const code = require('../lib/code.js');

/* 마이페이지 불러오기 */
router.post('/getUserPage.do',function(req,res){
    connection.query(
        `select A.user_id
              , A.user_name
              , (select count(*) from zoz7184.nb_post where reg_id=?) post_cnt
              , (select count(*) from zoz7184.nb_follow where follow_req_id=?) follow_req_cnt
              , (select count(*) from zoz7184.nb_follow where follow_res_id=?) follow_res_cnt
              , A.user_content
           from zoz7184.nb_user A
          where A.user_id = ?`
        ,[req.body.id
            , req.body.id
            , req.body.id
            , req.body.id]
        ,function(err,results,fields){
            console.info("sql",this.sql);
            if(err){
                res.send(code.resResultObj("ERR_01",err));
                throw err;
            } 
            res.send(code.resResultObj("SUCC_01",results)); 
        }
    );
});

module.exports = router;