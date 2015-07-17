var express = require('express'),
	app = new express(),
	ejs = require('ejs'),
	mongojs = require('mongojs'),
	users = mongojs('users',['table']),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('cookie-session');

app.use(express.static(__dirname + '/www'));
app.use(cookieParser());
app.use(bodyParser()); //open GER,POST body parser
app.use(session({
  keys: ['cookie', 'https://www.youtube.com/watch?v=SR6iYWJxHqs']
}));
app.set('views', __dirname + '/www'); //views engine path
app.set('view engine', 'ejs');


var auth = require('./router/auth.js');
app.get('/login',auth.loginPage);
app.get('/register',auth.registerPage);
app.post('/login',auth.login);
app.post('/register',auth.register);
app.get('/logout',auth.logout);
app.get('/profile/:id',auth.profile);
app.get('/profile/',auth.isLogin,function(req,res){
	var username = req.session.username;
	res.redirect('/profile/'+username);
});
//post article
var article = require('./router/article.js');
app.get('/',auth.isLogin,article.index);
app.post('/post',auth.isLogin,article.post);

app.post('/lookup',auth.isLogin,auth.Lookup);
app.post('/unlookup',auth.isLogin,auth.unLookup);

app.listen(80,"localhost");