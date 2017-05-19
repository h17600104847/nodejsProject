//登陆后才能执行的路由
module.exports.checkLogin = function (req,res,next) {
    if (req.session.user) {
        next();
    } else {
        req.flash('error','当前路由只有在用户登陆后才能执行，请先登录');
        res.redirect('/user/login');
    }
};

//未登录后才能执行的路由
module.exports.checkNotLogin = function (req,res,next) {
    if (req.session.user) {
        req.flash("error","当前路由只能在用户未登录的时候才能访问，请先退出");
        res.redirect("/");
    } else {
        next();
    }
}
