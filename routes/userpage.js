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
        `
         SELECT A.USER_ID   AS userId
              , A.USER_NAME AS userName
              , COUNT(P.POST_ID) AS postCnt
              , (SELECT COUNT(*) FROM zoz7184.NB_FOLLOW WHERE FOLLOW_REQ_ID=?) AS followReqCnt
              , (SELECT COUNT(*) FROM zoz7184.NB_FOLLOW WHERE FOLLOW_RES_ID=?) AS followResCnt
              , A.USER_CONTENT AS userContent
           FROM zoz7184.NB_USER A
              , zoz7184.NB_POST P
              , zoz7184.NB_FOLLOW F
          WHERE A.USER_ID = ?
            AND A.USER_ID = P.REG_ID
            AND (
                       F.FOLLOW_REQ_ID = A.USER_ID
                    OR F.FOLLOW_RES_ID = A.USER_ID
                )
        `
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