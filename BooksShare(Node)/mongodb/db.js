var mongoose = require("mongoose");
mongoose.connect(require("../dburl").dburl);
var userSchema = new mongoose.Schema({
    username : String,
    password : String,
    email : String,
    avatar : String
});
var userModel = mongoose.model("user",userSchema);
var articleSchema = new mongoose.Schema({
    title : String,
    content : String,
    poster : String,
    createAt : {
        type : Date,
        default : Date.now()
    },
    user : {
        type : mongoose.Schema.Types.Object,
        ref : "user"
    }
});
var articleModel = mongoose.model("article",articleSchema);
module.exports.userModel = userModel;
module.exports.articleModel = articleModel;