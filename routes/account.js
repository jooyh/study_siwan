const express = require('express');
const router = express.Router();
const fs = require('fs');
const crypto = require('crypto');
const db = require('../lib/common/db.js');

/* Email 중복체크 */
router.post('/idcheck.do',function(req,res){
    db.query(
        `select count(*) as cnt from zoz7184.nb_user where user_email = ?`
        ,[req.body.email]
        ,function(err,results,fields){
            if(err) throw err;
            res.send(results[0]);
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
            if(err) throw err;
            res.send({code:'SUCC'});
        }
    );
});

router.post('/getUserList.do',function(req,res){
    
    fs.readFile(`./data/userInfo.json`, 'utf8', function(err, content){
        var userList;
        if(!content){
            userList = [];
        }else{
            userList = JSON.parse(content);
        }
        userList.push(req.body);
        res.send(userList);
    });
});

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
            if(err) throw err;
            req.session.user = results[0];
            res.send(results);
        }
    );
});

module.exports = router;