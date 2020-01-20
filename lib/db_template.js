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
    console.log("SQL::> ",this.sql);
    db.query(sql,params,function(err,results,field){
        cb(err,results);
    })

}

module.exports = db;