const express = require('express');
const router = express.Router();
const fs = require('fs');
const crypto = require('crypto');
const db = require('../lib/db.js');
const code = require('../lib/code.js');

/* Email 중복체크 */
router.post('/idcheck.do',function(req,res){
    db.query(
        `select count(*) as cnt from zoz7184.nb_user where user_email = ?`
        ,[req.body.email]
        ,function(err,results,fields){
            if(err){
                res.send(code.resResultObj("ERR_01",err));
                throw err;
            } 
            res.send(code.resResultObj("SUCC_01",results));
        }
    );
});

/* 회원가입 */
router.post('/join.do',function(req,res){
    req.body.pw = crypto.createHash('sha512').update(req.body.pw).digest('base64'); 
    db.query(
        `insert into zoz7184.nb_user 
        (
            user_email
            ,user_pw
            ,user_name
            ,reg_dtm
            ,upd_dtm
        ) values
        (   ?
            ,?
            ,?
            ,now()
            ,now()
        )`
        ,[req.body.email,req.body.pw,req.body.name]
        ,function(err,results,fields){
            if(err){
                res.send(code.resResultObj("ERR_02",err));
                throw err;
            }
            res.send(code.resResultObj("SUCC_02",results));
        }
    );
});

/* LOGIN */
router.post('/login.do',function(req,res){
    req.body.pw = crypto.createHash('sha512').update(req.body.pw).digest('base64'); 
    db.query(
        `select user_id
               ,user_name
               ,user_email
               ,user_status
           from zoz7184.nb_user 
          where user_email = ? 
            and user_pw = ?`
        ,[req.body.email,req.body.pw ]
        ,function(err,results,fields){
            if(err){
                res.send(code.resResultObj("ERR_01",err));
                throw err;
            }
            req.session.user = results[0];
            res.send(code.resResultObj("SUCC_01",results));
        }
    );
});

/* FOLLOW */
router.post('/reqFollow.do',function(req,res){
    selectUserInfo(req,res,insertFollow);
});

function selectUserInfo(req,res,cb){
    db.query(
        `select user_id
               ,user_name
               ,user_email
               ,user_status
           from zoz7184.nb_user 
          where user_email = ? 
            and user_id = ?
        `
        ,[req.body.email,req.body.id ]
        ,function(err,results,fields){
            if(err){
                res.send(code.resResultObj("ERR_01",err));
                throw err;
            }
            if(results.length == 0){
                res.send(code.resResultObj("VAL_01"),results);
            }else{
                cb(req.session.user_id,results.user_id,res);
            }
        }
    );
}

function insertFollow(reqId,resId,res){
    db.query(
        `insert into zoz7184.nb_follow
        (
             follow_req_id
            ,follow_res_id
            ,reg_id
            ,upd_id
            ,reg_dtm
            ,upd_dtm
        )
        values
        (
             ?
            ,?
            ,?
            ,?
            ,now()
            ,now()
        )`
        ,[reqId,resId,reqId,reqId]
        ,function(err,results,fields){
            if(err){
                res.send(code.resResultObj("ERR_02",err));
                throw err;
            }
            res.send(code.resResultObj("SUCC_02"),results);
        }
    );
}
module.exports = router;