const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require("path");
const connection = require('../lib/db.js');
const async = require("async");

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
                        file.userId = req.session.user.user_id;
                        insertFileInfo(postId,file,cb);
                    },function(err){ // Each End fnc;
                        if(err) throw err;
                        callback(null,arg)
                    });
                }
            ],
            function(err){ // waterfall End fnc;
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
                async.forEachOfLimit(arg, 1, function(post, index, cb) {
                    selectAtchFileList(post,cb);
                }, function() { // each END fnc.
                    callback(null, arg);
                })
            }]
            , function (err, results) {  // waterfall END fnc.
                if(err) throw err;
                res.send(results);
            } 
        );
    } catch (error) {
        console.log("err in getpostlist.do....")
        console.error(error);
        throw res.send({CODE:"ERR"});
    }
});

/******************** [ functions ] ********************/

//SELECT POST LIST IN DB
function selectPostList(req,cb){
    connection.query(
        `select post_id
               ,post_content
               ,post_hashtag
               ,reg_dtm
               ,reg_id
               ,upd_dtm
               ,upd_id
               ,(select user_name
                from zoz7184.nb_user u
               where p.reg_id = u.user_id) as user_name
           from zoz7184.nb_post p
          where reg_id in (?)
          order by upd_dtm desc
        `
        ,[req.session.user.user_id]
        ,function(err,postResults,fields){
            if(err) throw err;
            cb(null, postResults); 
        }
    );
}

//SELECT FILE LIST IN DB
function selectAtchFileList(postInfo,cb){
    connection.query(
        `select post_id
                ,file_id
                ,file_snm
                ,file_onm
                ,file_path
           from zoz7184.nb_atch_file
          where post_id = ?
          order by upd_dtm desc
        `
        ,[postInfo.post_id]
        , function(err,fileResults,fields){
            if(err) throw err;
            postInfo.fileArr = fileResults;
            cb();
        }
    )
}

//DELETE POST IN DB
function deletePostInfo(postId){
    connection.query(
        `delete from zoz7184.nb_post 
          where post_id = ? 
        `
        ,[postId]
        ,function (err,results,fields){
            if(err) throw err;
            return results;
        }
    )
}

//DELETE FILE IN DB
function deleteFileInfo(postId){
    connection.query(
        `delete from zoz7184.nb_atch_file 
          where post_id = ? 
        `
        ,[postId]
        ,function (err,results,fields){
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
    connection.query(
        `insert into zoz7184.nb_post 
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
            ,req.session.user.user_id
            ,req.session.user.user_id]
        ,function (err,results,fields){
            if(err) throw err;
            cb(null,results);
        }
    );
}

//INSERT FILE IN DB
function insertFileInfo(postId,file,cb){
    connection.query(
        `insert into zoz7184.nb_atch_file 
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