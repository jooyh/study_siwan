const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const path = require("path");
const connection = require('../lib/db.js');
const code = require('../lib/code.js');

/* 마이페이지 불러오기 */
router.post('/mypage.do',function(req,res){
    connection.query(
        `?`
        ,[req.body.id]
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