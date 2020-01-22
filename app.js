var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const compression = require('compression')
const helmet	= require('helmet');
const sessionParser = require('express-session');

const indexRouter   = require('./routes/index.js');
const accountRouter = require('./routes/account.js');
const postRouter    = require('./routes/post.js');
const chatRouter    = require('./routes/chat.js');

var app = express();

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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/'       ,indexRouter);
app.use('/account',accountRouter);
app.use('/post'   ,postRouter);
app.use('/chat'   ,chatRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// "start": "node ./bin/www"
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


/*** Socket.IO 추가 ***/
app.io = require('socket.io')();
app.io.on('connection', function(socket){
	socket.on("access", function(roomInfo) {
		console.log("Access",roomInfo)
		chatRouter.chatFncs.joinChatRoom(roomInfo,function(roomInfo){
			app.io.emit('access',roomInfo);
		});

		socket.on('sendMsg', function(msgInfo){
			chatRouter.chatFncs.sendMsg(msgInfo);
			app.io.emit('sendMsg',msgInfo);
		});
		
		socket.on('leaveRoom', function(roomInfo){
			app.io.emit('leaveRoom',roomInfo);
		});
	});
});

module.exports = app;
