const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require("path");
const async = require("async");
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

/** 
 * upload post router.
 */
router.post('/uploadpost.do',upload.array("atchFile"), function(req,res){
    var postId;
    try {
        async.waterfall(
            [
                function task1(callback) {
                    insertPostInfo(req,callback);
                },
                function task2(arg,callback) { 
                    postId = arg.insertId;
                    async.forEachOfLimit(req.files, 1, function(file, index, cb) {
                        file.userId = req.session.user.userId;
                        insertFileInfo(postId,file,cb);
                    },function eachEnd(err){ // Each End fnc;
                        if(err) throw err;
                        callback(null,arg)
                    });
                }
            ],
            function final(err){ // waterfall End fnc;
                if(err) throw err;
                res.send({code:"SUCC"});
            }
        );
    } catch (error) {
        console.log("err in uploadpost.do....")
        console.error(error);
        if(postId){
            deletePostInfo(postId);
            deleteFileInfo(postId);
        }
        if(req.files.length){
            deleteFile(req.files);
        } 
        res.send({code:"ERR"});
    }
});


/** 
 * get postList router.
 */
router.post('/getpostlist.do', function(req,res){
    try {
        async.waterfall(
            [function task1(callback) { 
                selectPostList(req,callback);
            }, function task2(arg, callback) {
                console.log("task2..")
                async.forEachOfLimit(arg, 1, function(post, index, cb) {
                    selectAtchFileList(post,cb);
                }, function eachEnd(err) { // each END fnc.
                    if(err) throw err;
                    callback(null,null, arg);
                })
            },function task3(arg,arg2,callback) { 
                async.forEachOfLimit(arg2, 1, function(post, index, cb) {
                    selectRecooment(post,cb);
                },function eachEnd(err){
                    if(err) throw err;
                    callback(null, arg2);
                });
            }]
            , function final(err, results) {  // waterfall END fnc.
                console.log("final..")
                if(err) throw err;
                res.send(code.resResultObj("SUCC_01",results));
            } 
        );
    } catch (error) {
        console.log("err in getpostlist.do....")
        console.error(error);
        res.send(code.resResultObj("ERR_01",error));
    }
});

router.post('/likePost.do', function(req,res){
    selectLike(req,res,insertLikePost,deleteLikePost);
});

//사용자페이지 게시물조회
router.post('/getUserPost.do', function(req,res){
    async.waterfall(
        [
            function task1(callback) { 
                selectPostInUserPage(req,res,callback)
            },
            function task2(arg,callback) { 
                async.forEachOfLimit(arg, 1, function(post, index, cb) {
                    selectAtchFileList(post,cb);
                },function eachEnd(err){
                    if(err) throw err;
                    callback(null, arg);
                });
            }
        ]
        , function final(err, results) {  // waterfall END fnc.
            if(err) throw err;
            res.send(code.resResultObj("SUCC_01",results));
        } 
    )
});

//댓글 등록
router.post('/insertRecomment.do', function(req,res){
    insertRecooment(req,res);
})
//댓글 등록
router.post('/deleteRecomment.do', function(req,res){
    deleteRecomment(req,res);
})
/******************** [ functions ] ********************/
function deleteRecomment(req,res){
    connection.execQuery(
        `DELETE FROM zoz7184.NB_RECOMMENT
          WHERE RECOMMENT_ID = ?
        `,
        [Number(req.body.recommentId)],
        function(err,results){
            if(err) throw err;
            // if(results.warningCount != 0){
                // res.send(code.resResultObj("ERR_04",results));
            // }else{
                res.send(code.resResultObj("SUCC_04",results));
            // }
        }
    )
}
//댓글 등록
function insertRecooment(req,res){
    connection.execQuery(
        `INSERT INTO zoz7184.NB_RECOMMENT
            (
                POST_ID
                ,RECOMMENT_CONTENT
                ,REG_ID
                ,UPD_ID
                ,REG_DTM
                ,UPD_DTM
            )VALUES(
                 ?
                ,?
                ,?
                ,?
                ,NOW()
                ,NOW()
            )
        `,
        [req.body.postId
        ,req.body.content
        ,req.session.user.userId
        ,req.session.user.userId],
        function(err,results){
            if(err) throw err;
            res.send(code.resResultObj("SUCC_02",results));
        }
    );
}

// 게시물 댓글조회
function selectRecooment(post,cb){
    connection.execQuery(
        `SELECT R.RECOMMENT_ID       AS recommentId
              , R.RECOMMENT_CONTENT  AS recommentContent
              , R.REG_ID             AS regId        
              , R.REG_DTM            AS regDtm
              , U.USER_EMAIL         AS userEmail
              , U.USER_ID            AS userId
              , U.USER_NAME          AS userName
           FROM zoz7184.NB_RECOMMENT R
              , zoz7184.NB_USER U
          WHERE R.REG_ID = U.USER_ID
            AND R.POST_ID = ?
          ORDER BY R.REG_DTM DESC
        `
        ,[post.post_id]
        ,function(err,results){
            if(err) throw err;
            post.recomments = results;
            cb();
        }
    );
}


// 사용자 페이지 게시물 조회
function selectPostInUserPage(req,res,cb){
    if(!req.body.start) req.body.start = 0;
    if(!req.body.unit) req.body.unit = 10;
    connection.execQuery(
        `SELECT 
                POST_ID       AS postId
              , POST_CONTENT  AS postContent
              , POST_HASHTAG  AS postHashtag
              , REG_DTM       AS regDtm
              , REG_ID        AS regId
              , UPD_DTM       AS updDtm
              , UPD_ID        AS updId
              , (SELECT USER_NAME
                   FROM zoz7184.NB_USER U
                  WHERE P.REG_ID = U.USER_ID) AS userName
          FROM zoz7184.NB_POST P
         WHERE REG_ID = (
                            SELECT USER_ID
                              FROM zoz7184.NB_USER
                             WHERE USER_EMAIL = ?
                        )
         LIMIT ? , ?
        `
        ,[req.body.email, Number(req.body.start), Number(req.body.unit)]
        ,function(err,results){
            if(err){
                res.send(code.resResultObj("ERR_01",err));
                throw err;
            }
            cb(null,results);
        }
    )
}

// 게시물 좋아요
function selectLike(req,res,likeCb,unLikeCb){
    connection.execQuery(
        `SELECT COUNT(*) AS cnt
           FROM zoz7184.NB_LIKE
          WHERE POST_ID = ?
            AND REG_ID = ?
        `
        ,[req.body.postId,req.session.user.userId]
        ,function(err,results){
            if(err){
                res.send(code.resResultObj("ERR_01",err));
                throw err;
            }
            console.log(results);
            if(results[0].cnt != 0){
                unLikeCb(req.body.postId,req.session.user.userId,res);
            }else{
                likeCb(req.body.postId,req.session.user.userId,res);
            }
        }
    );
}

// 좋아요 등록
function insertLikePost(postId,userId,res){
    connection.execQuery(
        `INSERT INTO zoz7184.NB_LIKE
         (
             POST_ID
            ,REG_ID
            ,UPD_ID
            ,REG_DTM
            ,UPD_DTM
         ) VALUES (
              ?
             ,?
             ,?
             ,NOW()
             ,NOW()
         )
        `
        ,[postId,userId,userId]
        ,function(err,results){
            if(err){
                res.send(code.resResultObj("ERR_02",err));
                throw err;
            }
            res.send(code.resResultObj("SUCC_02",'like'));
        }
    );
}

// 좋아요 해제
function deleteLikePost(postId,userId,res){
    connection.execQuery(
        `DELETE FROM zoz7184.NB_LIKE
          WHERE POST_ID = ?
            AND REG_ID = ?
        `
        ,[postId,userId]
        ,function(err,results){
            if(err){
                res.send(code.resResultObj("ERR_02",err));
                throw err;
            }
            res.send(code.resResultObj("SUCC_02",'unlike'));
        }
    );
}

//SELECT POST LIST IN DB
function selectPostList(req,cb){
    if(! req.body.start) req.body.start = 0
    if(! req.body.unit)  req.body.unit = 10;
    connection.execQuery(
        `SELECT POST_ID       AS postId
               ,POST_CONTENT  AS postContent
               ,POST_HASHTAG  AS postHashtag
               ,REG_DTM       AS regDtm
               ,REG_ID        AS regId
               ,UPD_DTM       AS updDtm
               ,UPD_ID        AS updId
               ,(SELECT USER_NAME
                FROM zoz7184.NB_USER U
               WHERE P.REG_ID = U.USER_ID) AS userName
           FROM zoz7184.NB_POST P
          WHERE REG_ID = ?
             OR REG_ID IN ( 
                           SELECT FOLLOW_RES_ID 
                             FROM zoz7184.NB_FOLLOW 
                            WHERE FOLLOW_REQ_ID = ? 
                         )
             OR POST_ID IN (
                            SELECT POST_ID
                              FROM zoz7184.NB_LIKE
                             WHERE REG_ID = ?
                          )
             OR POST_ID IN (
                            SELECT POST_ID
                              FROM zoz7184.NB_RECOMMENT
                             WHERE REG_ID = ?
                          )
          ORDER BY UPD_DTM DESC
          LIMIT ? , ?
        `
        ,[req.session.user.userId
         ,req.session.user.userId
         ,req.session.user.userId
         ,req.session.user.userId
         ,req.body.start
         ,req.body.unit]
        ,function(err,postResults){
            if(err) throw err;
            cb(null, postResults); 
        }
    );
}

//SELECT FILE LIST IN DB
function selectAtchFileList(postInfo,cb){
    connection.execQuery(
        `SELECT  POST_ID   AS postId
                ,FILE_ID   AS fileId
                ,FILE_SNM  AS fileSnm
                ,FILE_ONM  AS fileOnm
                ,FILE_PATH AS filePath
           FROM zoz7184.NB_ATCH_FILE
          WHERE POST_ID = ?
          ORDER BY UPD_DTM DESC
        `
        ,[postInfo.postId]
        , function(err,fileResults){
            if(err) throw err;
            postInfo.fileArr = fileResults;
            cb();
        }
    )
}

//DELETE POST IN DB
function deletePostInfo(postId){
    connection.execQuery(
        `DELETE FROM zoz7184.NB_POST 
          WHERE POST_ID = ? 
        `
        ,[postId]
        ,function (err,results){
            if(err) throw err;
            return results;
        }
    )
}

//DELETE FILE IN DB
function deleteFileInfo(postId){
    connection.execQuery(
        `DELETE FROM zoz7184.NB_ATCH_FILE 
          WHERE POST_ID = ? 
        `
        ,[postId]
        ,function (err,results){
            if(err) throw err;
            return results;
        }
    )
}

//DELETE FILE IN DIRECTORY
function deleteFile(fileList){
    for(var i=0; i<fileList.length; i++){
        fs.unlink(`./public/upload/${fileList.filename}`, function(err){
            if(err) throw err;
        });
    }
}

//INSERT POST IN DB
function insertPostInfo(req,cb){
    connection.execQuery(
        `insert into zoz7184.NB_POST 
        (
             post_content
            ,post_hashtag
            ,reg_id
            ,upd_id
            ,reg_dtm
            ,upd_dtm
        ) values
        (   ?
            ,?
            ,?
            ,?
            ,now()
            ,now()
        )`
        ,[req.body.content
            ,req.body.hashtag
            ,req.session.user.userId
            ,req.session.user.userId]
        ,function (err,results){
            if(err) throw err;
            cb(null,results);
        }
    );
}

//INSERT FILE IN DB
function insertFileInfo(postId,file,cb){
    connection.query(
        `insert into zoz7184.NB_ATCH_FILE 
        (
            post_id
            ,file_snm
            ,file_onm
            ,file_type
            ,file_path
            ,reg_id
            ,upd_id
            ,reg_dtm
            ,upd_dtm
        ) values
        (   ?
            ,?
            ,?
            ,?
            ,?
            ,?
            ,?
            ,now()
            ,now()
        )`
        ,[  postId,
            file.filename,
            file.originalname,
            'P',
            file.destination,
            file.userId,
            file.userId
        ]
        ,function(err,results,fields){
            if(err) throw err;
            cb();
        }
    );
}


module.exports = router;