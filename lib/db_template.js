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

db.execQuery = function(sql,params,cb){
    db.query(sql,params,function(err,results,field){
        console.log("SQL::> ",this.sql);
        cb(err,results);
    })
}

module.exports = db;