const mysql = require('mysql');

const db = mysql.createConnection({
     host : ''
    ,user : ''
    ,password : ''
    ,dataase : ''
});

module.exports = db;