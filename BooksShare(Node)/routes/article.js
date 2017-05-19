var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth');
var articleModel = require('../mongodb/db').articleModel;
var multer = require('multer');

var storage = multer.diskStorage({
    destination : function (req,file,cb) {
        cb(null,'../public/uploads');
    },
    filename : function (req,file,cb) {
        cb(null,file.originalname);
    },
});

var upload = multer({storage:storage});
router.get('/add',auth.checkLogin,function (req,res) {
    res.render('article/add',{title:'发表文章'});
});
router.post('/add',auth.checkLogin,upload.single('poster'),function (req,res){
    var articleInfo = req.body;
    articleInfo.createAt = Date.now();
    articleInfo.user = req.session.user._id;

    if (req.file) {
        articleInfo.poster = '/uploads/' + req.file.filename;
    }
    articleModel.create(articleInfo,function (err,doc) {
        if (!err) {
            //req.flash('success','');
            res.redirect('/user/info');
        } else {
            //req.flash('error','');
            req.redirect('back');
        }
    })
});

router.get("/detail/:id",auth.checkLogin,function (req,res) {
    var id = req.params.id;
    articleModel.findById({_id:id},function (err,article) {
        console.log(article);//undefined
        article.user = req.session.user;
        if (!err) {
            //req.flash("error","进入文章详情页成功");
            res.render('article/detail',{title:'文章详情',article:article});
        } else {
            //req.flash("error",'');
            res.redirect("back");
        }
    });
});

router.get("/remove/:id",auth.checkLogin,function (req,res) {
    var id = req.params.id;
    articleModel.findOneAndRemove({_id:id},function (err,article) {
        if (!err) {
            res.redirect("/user/info");
        } else {
            res.redirect("back");
        }
    });
});

router.get("/edit/:id",auth.checkLogin,function (req,res) {
    var id = req.params.id;
    articleModel.findById({_id:id},function (err,article) {
        if (!err) {
             res.render("article/edit",{title:"文章修改",article:article});
        } else {
            req.flash("error","");
            res.redirect("back");
        }
    })
})

router.post('/edit/:id',auth.checkLogin,upload.single('poster'),function (req,res){
    var articleInfo = req.body;
    var id = req.params.id;
    articleInfo.createAt = Date.now();
    articleInfo.user = req.session.user._id;

    if (req.file) {
        articleInfo.poster = '/uploads/' + req.file.filename;
    }
    articleModel.update({_id:id},{$set:articleInfo},function (err,doc) {
        if (!err) {
            res.redirect('/user/info');
        } else {
            req.flash('error','');
            req.redirect('back');
        }
    })
});
module.exports = router;