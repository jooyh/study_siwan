const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require("path");
const connection = require('../lib/common/db.js');
var async = require("async");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './resources/upload/')
    },
    filename: function (req, file, cb) {
        var extension = path.extname(file.originalname);
        cb(null, Date.now() + extension)
    }
});

const upload = multer({storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

//파일등록
router.post('/uploadpost.do',upload.array("atchFile"), function(req,res){
    connection.beginTransaction(function(err) {
        if (err) { 
            console.log('transaction err...');
            throw err; 
        }
        console.log("req.session",req.session);
        //게시물 등록
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
                console.log("post.. insert",results);
                if(err){
                    console.error(err);
                    connection.rollback(function(rollback_error) {
                        throw err;
                    });
                } 
                //게시물 아이디로 파일 등록
                for(var i=0; i<this.req.files.length; i++){
                    var file = this.req.files[i];
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
                        ,[results.insertId,
                            file.filename,
                            file.originalname,
                            'P',
                            file.destination,
                            this.req.session.user.user_id,
                            this.req.session.user.user_id]
                        ,function(fErr,results,fields){
                            if(fErr){
                                console.log("file insert err ..... ")
                                connection.rollback(function(rollback_error) {
                                    console.log("rollback");
                                    throw fErr;
                                });
                            }
                            connection.commit(function(cmErr) {
                                if (cmErr) {
                                    connection.rollback(function(rollback_error) {
                                        throw cmErr;
                                    });
                                }
                            });
                            this.res.send({code:'SUCC'});
                        }.bind(this)
                    );
                }
            }.bind({req:req,res:res})
        );
    });
});



router.post('/getpostlist.do', async function(req,res){
    async.waterfall(
        [function task1(callback) { 
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
                    console.log("task1",postResults);
                    callback(null, postResults); 
                }
            );
        }, function task2(arg, callback) {
            async.forEachOfLimit(arg, 1, function(post, index, cb) {
                console.log("TEST EACH "+index, arg[index]);
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
                    ,[arg[index].post_id]
                    , function(err,fileResults,fields){
                        if(err) throw err;
                        arg[index].fileArr = fileResults;
                        cb();
                    }
                )
            }, function() {
                console.log('ALL done')
                callback(null, arg);
            })
        }]
        , function (err, results) { 
            console.log('task finish'); 
            console.log(results); 
            res.send(results);
        } 
    );
});

router.post('/getpostlist.do', async function(req,res){
    var postList; 
    await connection.query(
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
        ,await function(err,postResults,fields){
            if(err) throw err;
            postList = postResults;
        }
    );

    for(var i=0; i<postList.length; i++){
        await connection.query(
            `select post_id
                    ,file_id
                    ,file_snm
                    ,file_onm
                    ,file_path
               from zoz7184.nb_atch_file
              where post_id = ?
              order by upd_dtm desc
            `
            ,[postList[i].post_id]
            ,await function(err,fileResults,fields){
                if(err) throw err;
                // console.log("test",fileResults);
                postList[i].fileArr = fileResults;
                console.log("Q2 result...")
            }
        )
    }
    console.log("for End...")



    console.log("bf send...",results);
    res.send(postResults);
});

router.post('/test.do',upload.array("atchFile"),function(req,res){
    res.send(req.files); 
});

module.exports = router;