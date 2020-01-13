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
            req.body.regDtm = req.reqTime.format("yyyyMMdd_hhmmss");
            req.body.updDtm = req.reqTime.format("yyyyMMdd_hhmmss");

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

Date.prototype.format = function(f) {
	if (!this.valueOf()) return " ";

	var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
	var d = this;
	
	return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
		switch ($1) {
			case "yyyy": return d.getFullYear();
			case "yy": return (d.getFullYear() % 1000).zf(2);
			case "MM": return (d.getMonth() + 1).zf(2);
			case "dd": return d.getDate().zf(2);
			case "E": return weekName[d.getDay()];
			case "HH": return d.getHours().zf(2);
			case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
			case "mm": return d.getMinutes().zf(2);
			case "ss": return d.getSeconds().zf(2);
			case "a/p": return d.getHours() < 12 ? "오전" : "오후";
			default: return $1;
		}
	});
};

String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};