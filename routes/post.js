const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require("path");
const db = require('../lib/common/db.js');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './resources/upload/')
    },
    filename: function (req, file, cb) {
        var extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + extension)
    }
});

const upload = multer({storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

//파일등록
router.post('/uploadpost.do',upload.array("atchFile"), function(req,res){
    db.beginTransaction(function(err) {
        if (err) { 
            console.log('transaction err...');
            throw err; 
        }
        console.log("req.session",req.session);
        //게시물 등록
        db.query(
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
                    db.rollback(function(rollback_error) {
                        throw err;
                    });
                } 
                //게시물 아이디로 파일 등록
                for(var i=0; i<this.req.files.length; i++){
                    var file = this.req.files[i];
                    db.query(
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
                                db.rollback(function(rollback_error) {
                                    console.log("rollback");
                                    throw fErr;
                                });
                            }
                            db.commit(function(cmErr) {
                                if (cmErr) {
                                    db.rollback(function(rollback_error) {
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

router.post('/getpostlist.do',function(req,res){
    db.query(
        `select post_id
               ,post_content
               ,post_hashtag
               ,reg_dtm
               ,reg_id
               ,upd_dtm
               ,upd_id
           from zoz7184.nb_post
          where reg_id in (?)
          order by upd_dtm desc
        `
        ,[req.session.user.user_id]
        ,function(err,results,fields){
            console.log("post result ",results)
            if(err) throw err;
            for(var i=0; i<results.length; i++){
                db.query(
                    `select post_id
                            ,file_id
                            ,file_snm
                            ,file_onm
                            ,file_path
                       from zoz7184.nb_atch_file
                      where post_id = ?
                      order by upd_dtm desc
                    `
                    ,[results[i].post_id]
                    ,function(err,fileResults,fields){
                        if(err) throw err;
                        console.log("test",fileResults);
                        this.fileArr = fileResults;
                    }.bind({post:results[i]})
                )
            }
            console.log("bf send...",results[i]);
        }
    );
});

router.post('/test.do',upload.array("atchFile"),function(req,res){
    res.send(req.files); 
});

module.exports = router;