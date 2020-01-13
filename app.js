const express = require('express');
const app = express();
app.use(express.json())
const port = 3000;
const fs = require('fs');
const template = require('./lib/common/template.js');

app.use(express.static('resources'));

app.get('/', function(req, res){
    fs.readFile(`./html/login.html`, 'utf8', function(err, content){
        res.send(template.getHtml(content));
    });
});
app.get('/main', function(req, res){
    fs.readFile(`./html/main.html`, 'utf8', function(err, content){
        res.send(template.getHtml(content));
    });
});

app.post('/idcheck.do',function(req,res){
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

app.post('/join.do',function(req,res){
    console.log("reqData",req.body);

    fs.readFile(`./data/userInfo.json`, 'utf8', function(err, content){
        var userList;
        if(!content){
            userList = [];
        }else{
            userList = JSON.parse(content);
        }
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));