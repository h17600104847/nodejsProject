var express = require('express');//引入express模块
var path = require('path');//引入path模块（dirname,join,resolve）
var favicon = require('serve-favicon');//引入serve-favicon模块
var logger = require('morgan');//日志打印
var cookieParser = require('cookie-parser');//引入cookie模块，进行cookie处理（req.cookies,res.cookie）
var bodyParser = require('body-parser');//用来接收post请求，请求体的信息
var session = require("express-session");//引入session模块
var MongoStore = require("connect-mongo")(session);
var flash = require("connect-flash");

//路由容器
var index = require('./routes/index');//处理首页路由
var user = require('./routes/user');//处理用户页路由
var article = require("./routes/article");//处理文章相关的路由


var app = express();//创建app

// view engine setup  设置模板引擎文件
app.set('views', path.join(__dirname, 'views'));//设置模板引擎文件根路径
app.set('view engine', 'html');//设置模板引擎文件类型
app.engine("html",require("ejs").__express);//设置ejs解析

// uncomment after placing your favicon in /public
//中间件的使用
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json());//用来处理post请求体是json对象   {name:"chenchao",age:18}
app.use(bodyParser.urlencoded({ extended: false }));//用来处理post表单提交  name=chenchao&age=18
app.use(cookieParser());//cookieParser的使用
app.use(express.static(path.join(__dirname, 'public')));//静态资源文件的处理

app.use(session({//使用session
  secret : "come",
  resave : true,
  saveUninitialized : true,
  store : new MongoStore({//将session与数据库进行关联，以后session在存储的时候自动保存在数据库中
    url : require("./dbUrl").dburl
  })
}))

//使用flash,放在session的后面
app.use(flash());

//将所有路由都执行的操作放在公共中间件中执行
app.use(function (req,res,next) {
  //向所有的模板引擎文件中传递user值
  res.locals.user = req.session.user;
  //取出flash值，赋值给提示面板
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.keyword = req.session.keyword;
  next();
})


//所有是/开头的路由都交给index路由处理
app.use('/', index);
//所有是users开头的路由都交给users路由处理
app.use('/user', user);
//所有article开头的路由，都交给article处理
app.use("/article",article);

// catch 404 and forward to error handler
//错误路由的处理
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  //向模板引擎中传递数据
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;