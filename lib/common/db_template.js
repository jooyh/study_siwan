const mysql = require('mysql');

const db = mysql.createConnection({
     host : ''
    ,user : ''
    ,password : ''
    ,dataase : ''
    ,typeCast: function (field, next) {
        if (field.type == 'VAR_STRING') {
            return field.string();
        }
        return next();
    }
});

module.exports = db;