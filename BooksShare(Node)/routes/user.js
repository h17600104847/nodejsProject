var express = require('express');
var router = express.Router();
var userModel = require('../mongodb/db').userModel;
var md5 = require("../md5/md5");
var auth = require('../middleware/auth');
var markdown = require("markdown").markdown;
var articleModel = require("../mongodb/db").articleModel;


router.get('/',function (req,res,next) {
    res.render('index',{title:'欢迎登陆'});
})
//注册
router.get('/reg',auth.checkNotLogin,function (req,res) {
    res.render('user/reg',{title:'注册'})
})

router.post('/reg',auth.checkNotLogin,function (req,res) {
    //获取表单提交内容
    var userInfo = req.body;
    //保存用户的注册信息  数组  文件  数据库
    userInfo.password = md5(userInfo.password);
    //生成头像的url地址
    userInfo.avatar = 'https://secure.gravatar.com/avatar/' + userInfo.email + '?/s=48';
    //用户名不能一样
    var query = {username : userInfo.username}
    userModel.findOne(query,function (err,doc) {
        if (!err) {
            if (doc) {
                //req.flash("error", "当前用户已经注册，请更换用户名和密码");
                res.redirect("back");
            } else {
                userModel.create(userInfo, function (err, doc) {
                    if (!err) {
                        //req.flash('success', '注册用户信息成功');
                        res.redirect('/user/login');
                    } else {
                        //req.flash('error', '注册用户信息失败');
                        res.redirect('back');
                    }
                });
            }
        } else {
            //req.flash('error','数据库中查找注册信息失败');
            res.redirect('back');
        }
    })
});

//登录
router.get('/login',auth.checkNotLogin,function (req,res) {
    res.render('user/login',{title:"登录"})
})

router.post("/login",auth.checkNotLogin,function (req,res) {
    var userInfo = req.body;
    console.log(userInfo);
    userInfo.password = md5(userInfo.password);
    userModel.findOne(userInfo,function (err,doc) {
        if (!err) {
            if (doc) {
                req.flash("success",'登录成功');
                req.session.user = doc;
                res.redirect('/user/info');
            } else {
                req.flash('error',"当前用户未注册，请先登录");
                res.redirect('/user/reg');
            }
        } else {
            req.flash('error','登录失败');
            res.redirect("back");
        }
    })
});



router.get('/info',function (req,res,next) {
    var keyword = req.query.keyword;
    var queryObj = {};
    if (keyword) {//搜索
        req.session.keyword = keyword;
        var reg = new RegExp(keyword,"i");
        queryObj = {$or:[{title:reg},{content:reg}]};
    }
    var pageNum = parseInt(req.query.pageNum) || 1;
    var pageSize = parseInt(req.query.pageSize)||5;

    articleModel.find(queryObj)
        .skip((pageNum - 1)*pageSize)
        .limit(pageSize)
        .populate('user')
        .exec(function (err,article) {
            if (!err) {
                //req.flash('success','');
                article.forEach(function (article,index) {
                    article.conent = markdown.toHTML(article.content);
                });
                articleModel.count(queryObj,function (err,count) {
                    if (!err) {
                        res.render('user/info',{
                            title:'My BLOG',
                            articles:article,
                            keyword:keyword,
                            pageNum:pageNum,
                            pageSize:pageSize,
                            totalPage:Math.ceil(parseInt(count)/pageSize)
                        });
                    } else {
                        //req.flash('error','');
                        res.redirect('back');
                    }
                })
            } else {
                //req.flash('error','');
                res.redirect('back');
            }
        })
});


//退出
router.get("/logout",auth.checkLogin,function (req,res) {
    req.flash('success','用户退出成功');
    req.session.user = null;
    res.redirect('/');
})
module.exports = router;















