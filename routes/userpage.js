const express = require('express');
const router = express.Router();
const connection = require('../lib/db.js');
const code = require('../lib/code.js');

/* 마이페이지 불러오기 */
router.post('/getUserPage.do',function(req,res){
    connection.execQuery(
        `SELECT A.USER_ID   AS userId
              , A.USER_NAME AS userName
              , (SELECT COUNT(*) FROM zoz7184.NB_POST WHERE REG_ID=?) AS postCnt
              , (SELECT COUNT(*) FROM zoz7184.NB_FOLLOW WHERE FOLLOW_REQ_ID=?) AS followReqCnt /*팔로잉*/
              , (SELECT COUNT(*) FROM zoz7184.NB_FOLLOW WHERE FOLLOW_RES_ID=?) AS followResCnt /*팔로워*/
              , IFNULL(A.USER_CONTENT,"") AS userContent
           FROM zoz7184.NB_USER A
          WHERE A.USER_ID = ?`
        ,[req.body.id
        , req.body.id
        , req.body.id
        , req.body.id]
        ,function(err,results,fields){
            if(err){
                res.send(code.resResultObj("ERR_01",err));
                throw err;
            } 
            res.send(code.resResultObj("SUCC_01",results)); 
        }
    );
});

// /* 마이페이지 불러오기 */
// router.post('/getUserPage.do',function(req,res){
//     connection.query(
//         `select A.user_id
//               , A.user_name
//               , (select count(*) from zoz7184.nb_post where reg_id=?) post_cnt
//               , (select count(*) from zoz7184.nb_follow where follow_req_id=?) follow_req_cnt /*팔로잉*/
//               , (select count(*) from zoz7184.nb_follow where follow_res_id=?) follow_res_cnt /*팔로워*/
//               , ifnull(A.user_content,"") user_content
//            from zoz7184.nb_user A
//           where A.user_id = ?`
//         ,[req.body.id
//             , req.body.id
//             , req.body.id
//             , req.body.id]
//         ,function(err,results,fields){
//             console.info("sql",this.sql);
//             if(err){
//                 res.send(code.resResultObj("ERR_01",err));
//                 throw err;
//             } 
//             res.send(code.resResultObj("SUCC_01",results)); 
//         }
//     );
// });

module.exports = router;