const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const template = require('./lib/common/template.js');

app.use(express.urlencoded({extended:false}));
app.use(express.static('resources'));
app.post("*",function(req,res,next){
    req.reqTime = new Date();
    next();
});

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
app.get('/timeline', function(req, res){
    fs.readFile(`./html/timeline.html`, 'utf8', function(err, content){
        res.send(template.getHtml(content));
    });
});
app.get('/userpage', function(req, res){
    fs.readFile(`./html/userpage.html`, 'utf8', function(err, content){
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

app.post('/getUserList.do',function(req,res){
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

app.post('/loginin.do',function(req,res){
    console.log("reqData",req.body);
    var userList;
    fs.readFile(`./data/userInfo.json`, 'utf8', function(err, content){
        console.log('content',content);
        if(!content){
            userList = [];
        }else{
            userList = JSON.parse(content);
        }

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


    app.post('/uploadpost.do',function(req,res){
        var randomIdx = Math.random() * (1000 - 0) + 0;
        var postIdx = req.reqTime.getTime()+"_"+randomIdx;
        req.body.postIdx = postIdx;

        fs.readFile(`./data/post.json`, 'utf8', function(err, content){
            var postList;
            if(!content){
                postList = [];
            }else{
                postList = JSON.parse(content);
            }
            postList.push(req.body.postIdx);

            fs.writeFile(`./data/post.json`, JSON.stringify(postList), 'utf8', function(err){
                if(!err){
                    res.send({code:'SUCC'});
                }else{
                    res.send({code:'ERR'});
                }
            });
        });
    });

    app.post('/getpostlist.do',function(req,res){
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
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));