const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require("path");

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

router.post('/uploadpost.do',function(req,res){
    var randomIdx = Math.round(Math.random() * (1000 - 0) + 0);
    var postIdx = req.reqTime.getTime()+"_"+randomIdx;

    fs.readFile(`./data/post.json`, 'utf8', function(err, content){
        var postList;
        if(!content){
            postList = [];
        }else{
            postList = JSON.parse(content);
        }
        
        fs.writeFile(`./data/post.json`, JSON.stringify(postList), 'utf8', function(err){
            if(!err){
                res.send({code:'SUCC'});
            }else{
                res.send({code:'ERR'});
            }

            req.body.postIdx = postIdx;
            req.body.regDtm = req.reqTime.format("yyyyMMdd_hhmmss");
            req.body.updDtm = req.reqTime.format("yyyyMMdd_hhmmss");
            postList.push(req.body);

            fs.writeFile(`./data/post.json`, JSON.stringify(postList), 'utf8', function(err){
                if(!err){
                    res.send({code:'SUCC'});
                }else{
                    res.send({code:'ERR'});
                }
            });
        });
    });
});

router.post('/getpostlist.do',function(req,res){
    fs.readFile(`./data/post.json`, 'utf8', function(err, content){
        var postList;
        if(!content){
            postList = [];
        }else{
            postList = JSON.parse(content);
        }
        res.send(postList);
    });
});

router.post('/test.do',upload.array("atchFile"),function(req,res){
    console.log(req.files);
    res.send(req.files); 
});

module.exports = router;