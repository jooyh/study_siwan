const express = require('express');
const router = express.Router();
const fs = require('fs');
const crypto = require('crypto');

router.post('/idcheck.do',function(req,res){
    console.log("reqData",req.body);
    var userList;
    fs.readFile(`./data/userInfo.json`, 'utf8', function(err, content){
        console.log('content',content);
        if(!content){
            userList = [];
        }else{
            userList = JSON.parse(content);
        }

        var isDuple = false;
        for(var i in userList){
            console.log(i,userList[i].email)
            console.log(req.body.email)
            if(userList[i].email == req.body.email){
                isDuple = true;
            }
        }
        res.send(isDuple);
    });
});

router.post('/join.do',function(req,res){
    console.log("reqData",req.body);

    fs.readFile(`./data/userInfo.json`, 'utf8', function(err, content){
        var userList;
        if(!content){
            userList = [];
        }else{
            userList = JSON.parse(content);
        }
        console.log("userList",userList)
        userList.push(req.body);

        fs.writeFile(`./data/userInfo.json`, JSON.stringify(userList), 'utf8', function(err){
            if(!err){
                res.send({code:'SUCC'});
            }else{
                res.send({code:'ERR'});
            }
        })
    });
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
    console.log("reqData",req.body);
    var userList;
    fs.readFile(`./data/userInfo.json`, 'utf8', function(err, content){
        console.log('content',content);
        if(!content){
            userList = [];
        }else{
            userList = JSON.parse(content);
        }
        var test = crypto.createHash('sha512').update(req.body.pw).digest('base64'); 
        console.log("TEST",test);
        var reqEmail = req.body.email;
        var reqPw = req.body.pw;
        var isResult = {code:'EMAIL_ERR'};
        for(var i in userList){
            if(userList[i].email == reqEmail && userList[i].pw == reqPw){
                isResult = {code:'SUCC'};
                break;
            }else if(userList[i].email == reqEmail && userList[i].pw != reqPw){
                isResult = {code:'PW_ERR'};
                break;
            }
        }
        console.log(isResult);
        res.send(isResult);
    });
});

module.exports = router;