const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const connection = require('../lib/db.js');
const code = require('../lib/code.js');

/* Email 중복체크 */
router.post('/idcheck.do',function(req,res){
    connection.query(
        `select count(*) as cnt from zoz7184.nb_user where user_email = ?`
        ,[req.body.email]
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

/* 회원가입 */
router.post('/join.do',function(req,res){
    req.body.pw = crypto.createHash('sha512').update(req.body.pw).digest('base64'); 
    connection.query(
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
            console.info("sql",this.sql);
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
    connection.query(
        `select user_id
               ,user_name
               ,user_email
               ,user_status
           from zoz7184.nb_user 
          where user_email = ? 
            and user_pw = ?`
        ,[req.body.email,req.body.pw ]
        ,function(err,results,fields){
            console.info("sql",this.sql);
            if(err){
                res.send(code.resResultObj("ERR_01",err));
                throw err;
            }
            if(results.length != 0){
                req.session.user = results[0];
                res.send(code.resResultObj("SUCC_01",results));
            }else{
                res.send(code.resResultObj("VAL_02",results));
            }
        }
    );
});

/* FOLLOW */
router.post('/reqFollow.do',function(req,res){
    selectUserInfo(req,res,selectFollowInfo,insertFollow,"follow");
});

/* FOLLOW */
router.post('/unFollow.do',function(req,res){
    selectUserInfo(req,res,deleteFollow,"follow");
});

router.post('/getUserInfo.do',function(req,res){
    selectUserInfo(req,res,function(userInfo){
        res.send(code.resResultObj("SUCC_01",userInfo));
    });
});
/*****************************[ function ]*************************************** */

function deleteFollow(selectedUserInfo,resId,res){
    connection.execQuery(
        `delete from zoz7184.nb_follow
          where follow_req_id = ?
            and follow_res_id = ?
        `
        ,[resId,selectedUserInfo.user_id]
        ,function(err,results){
            if(err){
                res.send(code.resResultObj("ERR_04",err));
                throw err;
            }
            res.send(code.resResultObj("SUCC_04",results));
        }
    )
}

function selectUserInfo(req,res,cb,cb2,sqlType){
    connection.execQuery(
        `select user_id
               ,user_name
               ,user_email
               ,user_status
           from zoz7184.nb_user 
          where user_email = ? 
            ${sqlType == 'follow' ? 'and user_email != ? ' : ''}
        `
        ,[req.body.email, req.session.user.user_email]
        ,function(err,results){
            if(err){
                res.send(code.resResultObj("ERR_01",err));
                throw err;
            }
            if(results.length == 0){
                res.send(code.resResultObj("VAL_01",results));
            }else{
                cb(results[0],req.session.user.user_id,res,cb2);
            }
        }
    );
}
function selectFollowInfo(resUserInfo,reqId,res,cb){
    connection.execQuery(
        `select count(*) AS cnt
           from zoz7184.nb_follow
          where follow_req_id = ?
            and follow_res_id = ?
        `
        ,[reqId, resUserInfo.user_id]
        ,function(err,results){
            if(err){
                res.send(code.resResultObj("ERR_01",err));
                throw err;
            }
            if(results[0].cnt != 0){
                res.send(code.resResultObj("VAL_03",results));
            }else{
                cb(reqId,resUserInfo.user_id,res);
            }
        }
    )
}

function insertFollow(reqId,resId,res){
    connection.execQuery(
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
        ,function(err,results){
            if(err){
                res.send(code.resResultObj("ERR_02",err));
                throw err;
            }
            res.send(code.resResultObj("SUCC_02",results));
        }
    );
}
module.exports = router;