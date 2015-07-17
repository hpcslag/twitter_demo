var mongojs = require('mongojs');
var users = mongojs('chenghsi',['users','article']);
var md5 = require('../lib/encrypt.js');

exports.isLogin = function(req,res,next){
	if(!!req.session.isLogin){
		next();
	}else{
		res.redirect('/login');
	}
}

exports.loginPage = function(req,res){
	if(!!req.session.isLogin){
		res.redirect('/');
	}else{
		res.render('login');	
	}
}

exports.registerPage = function(req,res){
	if(!!req.session.isLogin){
		res.redirect('/');
	}else{
		res.render('register');	
	}
}

exports.login = function(req,res){
	var username = req.body.username;
	var password = req.body.password;

	users.users.findOne({username:username,password:md5(password)},function(err,doc){
		if(!!doc){
			req.session.isLogin = true;
			req.session.username = doc.username;
			res.redirect('/');
		}else{
			users.users.findOne({email:username,password:md5(password)},function(err,docx){
				if(!!docx){
					req.session.isLogin = true;
					req.session.username = docx.username;
					res.redirect('/');
				}else{
					res.redirect('/login?err=1');
				}
			});
		}
	});
}

exports.register = function(req,res){
	var username = req.body.username;
	var password = req.body.password;
	var email = req.body.email;
	var name = req.body.name;

	if(!!username && !!password && !!email && !!name){
		//save in databas
		users.users.findOne({email:email,password:md5(password),username:username},function(err,doc){
			if(doc == null){
				users.users.insert({username:username,password:md5(password),email:email,name:name,friends:[]});
				req.session.isLogin = true;
				req.session.username = username;
				res.redirect('/');
			}else{
				res.redirect('/register?err=override');
			}
		});
	}else{
		res.redirect('/register?err=none');
	}
}

exports.logout = function(req,res){
	req.session.isLogin = false;
	req.session.username = false;

	res.redirect('/login');
}

exports.profile = function(req,res){
	var user = req.param('id');

	var username = req.session.username;

	var self = false;

	var isFriend = false;

	if(user == username){
		self = true;
	}

	users.users.findOne({username:user},function(err,doc){
		if(!!doc){
			users.article.find({username:user},function(err,docx){
				//檢查是不是好友
				if(!!req.session.isLogin && !self){
					//檢查是否登入, 而且不是自己
					users.users.findOne({username:username},function(err,userMe){
						for (var i = 0; i < userMe.friends.length; i++) {
							if(userMe.friends[i] == user){
								isFriend = true;
							}
						};
						res.render('profile',{username:user,avator:'http://www.gravatar.com/avatar/'+md5(doc.email),name:doc.name,article:docx,self:self,isFriend:isFriend});
					});
				}else{
					res.render('profile',{username:user,avator:'http://www.gravatar.com/avatar/'+md5(doc.email),name:doc.name,article:docx,self:self,isFriend:isFriend});
				}
			});
		}else{
			res.send('查無此用戶');
		}
	})

}

exports.Lookup = function(req,res){
	var username = req.session.username;
	var friend = req.body.friend;

	//不用檢查是否再次關注
	users.users.update({username:username},{
		$push:{
			friends:friend
		}
	});
	res.send("ok");
}

exports.unLookup = function(req,res){
	var username = req.session.username;
	var friend = req.body.friend;

	users.users.update({username:username},{
		$pull:{
			friends:friend
		}
	});
	res.send("ok");
}