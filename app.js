var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var wechat  = require('./wechat/wechat');
var config = require('./config');//引入配置文件
var wechatApp = new wechat(config); //实例wechat 模块
var log4js = require('log4js');
var session = require('express-session');

log4js.configure({
  appenders: { cheese: { type: 'file', filename: 'logs/access.log' } ,cheese1: { type: 'console'} },
  categories: { default: { appenders: ['cheese','cheese1'], level: 'info' } }
});

var index = require('./routes/index');
var users = require('./routes/users');
var getData = require('./routes/getData');
var postData = require('./routes/postData');
var formUpload = require('./routes/formUpload');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//express-session Demo
// Use the session middleware 
// app.use(session({ 
//   ////这里的name值得是cookie的name，默认cookie的name是：connect.sid
//   //name: 'hhw',
//   secret: 'keyboard cat', 
//   cookie: ('name', 'value', { path: '/', httpOnly: true,secure: false, maxAge:  6000 }),
//   //重新保存：强制会话保存即使是未修改的。默认为true但是得写上
//   resave: true, 
//   //强制“未初始化”的会话保存到存储。 
//   saveUninitialized: true,  
  
// }))
// // 只需要用express app的use方法将session挂载在‘/’路径即可，这样所有的路由都可以访问到session。
// //可以给要挂载的session传递不同的option参数，来控制session的不同特性 
// app.get('/', function(req, res, next) {
//   var sess = req.session//用这个属性获取session中保存的数据，而且返回的JSON数据
//   if (sess.views) {
//     sess.views++
//     res.setHeader('Content-Type', 'text/html');
//     res.setHeader('Charset','utf-8');
//     res.write('<p>欢迎第 ' + sess.views + '次访问       ' + 'expires in:' + (sess.cookie.maxAge / 1000) + 's</p>')
//     res.end();
//   } else {
//     sess.views = 1
//     res.end('welcome to the session demo. refresh!')
//   }
// });

app.use('/index', index);
app.post('/users', users);
app.get('/getData', getData);
app.post('/postData', postData);
app.post('/formUpload', formUpload);

//用于处理所有进入 80 端口 get 的连接请求

app.get("/",function(req,res){
    wechatApp.auth(req,res);
});

//用于处理所有进入 80 端口 post 的连接请求
app.post("/",function(req,res){
    wechatApp.handleMsg(req,res);
});

//用于请求获取 access_token
app.get("/getAccessToken",function(req,res){
    wechatApp.getAccessToken().then(function(data){
        res.send(data);
    });    
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
