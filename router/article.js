var mongojs = require('mongojs');
var article = mongojs('chenghsi',['article','users']);

exports.post = function(req,res){
	var username = req.session.username;
	var content = req.body.article;
	
	article.article.insert({username:username,content:content});

	res.send("ok");
}

exports.index = function(req,res){
	//find({$or:[{username:"gg"},{username:"hpcslag"}]);
	//取得好友列表
	var username = req.session.username;
	
	var s_friend = [];
	article.users.findOne({username:username},function(err,doc){
		for(var i =0;i<doc.friends.length;i++){
			s_friend.push({username:doc.friends[i]});
		}
		article.article.find({'$or':s_friend},function(err,docx){
			res.render('index',{article:docx});
		});
	});
}