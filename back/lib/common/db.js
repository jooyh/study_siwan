const mysql = require('mysql');

const db = mysql.createConnection({
     host : '183.111.174.35'
    ,user : 'zoz7184'
    ,password : 'qwe123!!'
    ,dataase : 'zoz7184'
    ,typeCast: function (field, next) {
        if (field.type == 'VAR_STRING') {
            return field.string();
        }
        return next();
    }
});

module.exports = db;