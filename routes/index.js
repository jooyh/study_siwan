const express = require('express');
const router = express.Router();
const template = require('../lib/common/template.js');
const fs = require('fs');

router.get('/', function(req, res){
    res.redirect("/login");
});

router.get('/login', function(req, res){
    fs.readFile(`./html/login.html`, 'utf8', function(err, content){
        res.send(template.getHtml(content));
    });
});
router.get('/timeline', function(req, res){
    fs.readFile(`./html/timeline.html`, 'utf8', function(err, content){
        res.send(template.getHtml(content));
    });
});
router.get('/userpage', function(req, res){
    fs.readFile(`./html/userpage.html`, 'utf8', function(err, content){
        res.send(template.getHtml(content));
    });
});

module.exports = router;