const express = require('express');
const app = express();
const port = 3000;

const indexRouter   = require('./routes/index.js');
const accountRouter = require('./routes/account.js');
const postRouter    = require('./routes/post.js');

const compression = require('compression')
const helmet	= require('helmet');
const sessionParser = require('express-session');

app.use(sessionParser({
    secret: 'nulbo',
    resave: true,
    saveUninitialized: true
}));

app.use(function(req,res,next){
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
	next();
});
app.use(compression());
app.use(helmet());
app.use(express.urlencoded({extended:false}));
app.use(express.static('resources'));
app.post("*",function(req,res,next){
    req.reqTime = new Date();
    next();
});

app.use('/'       ,indexRouter);
app.use('/account',accountRouter);
app.use('/post'   ,postRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
