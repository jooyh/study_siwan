const express = require('express');
const router = express.Router();
const template = require('../lib/template.js');
const fs = require('fs');

router.get('/', function(req, res){
    res.redirect("/login");
});

router.get('/login', function(req, res){
    req.session.destroy();
    fs.readFile(`./views/login.html`, 'utf8', function(err, content){
        res.send(template.getHtml(content));
    });
});
router.get('/timeline', function(req, res){
    if(!req.session.user){
        res.redirect("/");
        return;
    }
    if(!req.session.user) res.redirect("/");
    fs.readFile(`./views/timeline.html`, 'utf8', function(err, content){
        res.send(template.getHtml(content));
    });
});
router.get('/userpage', function(req, res){
    if(!req.session.user){
        res.redirect("/");
        return;
    }
    fs.readFile(`./views/userpage.html`, 'utf8', function(err, content){
        res.send(template.getHtml(content));
    });
});

router.get('/chat', function(req, res, next) {
    if(!req.session.user){
        res.redirect("/");
        return;
    }
    fs.readFile(`./views/chat.html`, 'utf8', function(err, content){
        res.send(template.getHtml(content));
    });
});
module.exports = router;