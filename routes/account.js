const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const path = require("path");
const connection = require('../lib/db.js');
const code = require('../lib/code.js');

//SET FILE STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/upload/')
    },
    filename: function (req, file, cb) {
        var extension = path.extname(file.originalname);
        cb(null, Date.now() + extension)
    }
});
const upload = multer({storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

/* Email 중복체크 */
router.post('/idcheck.do',function(req,res){
    connection.execQuery(
        `SELECT COUNT(*) AS cnt 
           FROM zoz7184.NB_USER 
          WHERE USER_EMAIL = ?`
        ,[req.body.email]
        ,function(err,results){
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
router.post('/join.do',upload.array("atchFile"), function(req,res){
// router.post('/join.do',function(req,res){
    req.body.pw = crypto.createHash('sha512').update(req.body.pw).digest('base64'); 

    // crypto.pbkdf2('비밀번호', "nulbo_salt_20190520" , 100000, 64, 'sha512', (err, key) => {
    //     console.log(key.toString('base64'));
    // });

    connection.execQuery( 
        `INSERT INTO zoz7184.NB_USER 
        (    USER_ID
            ,USER_EMAIL
            ,USER_PW
            ,USER_NAME
            ,USER_PRF_IMG_NAME
            ,REG_DTM
            ,UPD_DTM
        ) VALUES
        (    UUID()
            ,?
            ,?
            ,?
            ,?
            ,NOW()
            ,NOW()
        )`
        ,[req.body.email
            ,req.body.pw
            ,req.body.name
            ,req.body.files[0].filename
        ]
        ,function(err,results){
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
    connection.execQuery(
        `SELECT USER_ID     AS userId
               ,USER_NAME   AS userName
               ,USER_EMAIL  AS userEmail
               ,USER_STATUS AS userStatus
           FROM zoz7184.NB_USER 
          WHERE USER_EMAIL = ? 
            AND USER_PW = ?`
        ,[req.body.email,req.body.pw ]
        ,function(err,results){
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

router.post('/getUserList.do',function(req,res){
    selectUserList(req.body.searchData,function(err,results){
        if(err){
            res.send(code.resResultObj("ERR_01",err));
        }
        res.send(code.resResultObj("SUCC_01",results));
    })    
});
/*****************************[ function ]*************************************** */

function deleteFollow(selectedUserInfo,resId,res){
    connection.execQuery(
        `DELETE FROM zoz7184.NB_FOLLOW
          WHERE FOLLOW_REQ_ID = ?
            AND FOLLOW_RES_ID = ?
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
        `SELECT USER_ID      AS userId
               ,USER_NAME    AS userName
               ,USER_EMAIL   AS userEmail
               ,USER_STATUS  AS userStatus
           FROM zoz7184.NB_USER  
          WHERE USER_EMAIL = ? 
            ${sqlType == 'follow' ? 'AND USER_EMAIL != ? ' : ''}
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
        `SELECT COUNT(*) AS cnt
           FROM zoz7184.NB_FOLLOW
          WHERE FOLLOW_REQ_ID = ?
            AND FOLLOW_RES_ID = ?
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
        `INSERT INTO zoz7184.NB_FOLLOW
        (
             FOLLOW_REQ_ID
            ,FOLLOW_RES_ID
            ,REG_ID
            ,UPD_ID
            ,REG_DTM
            ,UPD_DTM
        )
        VALUES
        (
             ?
            ,?
            ,?
            ,?
            ,NOW()
            ,NOW()
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

function selectUserList(searchData,cb){
    connection.execQuery(
        `SELECT USER_ID    AS userId
              , USER_EMAIL AS userEmail
              , USER_NAME  AS userName
           FROM zoz7184.NB_USER
          WHERE USER_EMAIL LIKE CONCAT('%',?,'%')
             OR USER_NAME LIKE CONCAT('%',?,'%')
        `
        ,[searchData,searchData]
        ,function(err,results){
            if(err){
                cb(err);
            }
            cb(err,results)
        }
    );
}
module.exports = router;