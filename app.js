const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const template = require('./lib/common/template.js');

app.use(express.static('resources'));

app.get('/', function(req, res){
    fs.readFile(`./html/login.html`, 'utf8', function(err, content){
        res.send(template.getHtml(content));
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));