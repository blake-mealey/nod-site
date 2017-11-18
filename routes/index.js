var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/nod');

var User = require('../schemas/User.js');
var Folder = require('../schemas/Folder.js');
var Note = require('../schemas/Note.js');

// Connect to db
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {		// Test DB connection
	console.log('Connected successfully!');
});

// Middleware function to require a session user to load the page
// Renders 'require-login' if not logged in
function requiresLogin(req, res, next) {
	if (req.session && req.session.user) return next();
	return res.render('require-login');
}

/* GET request for splash/login page */
router.get('/', function(req, res, next) {
    // TODO: Redirect to mynotes if signed in
    res.render('splash', {});
});

/* GET request for Sign Up page */
router.get('/signup', function(req, res, next) {
    res.render('signup', {});
});

/* GET request for My Notes page */
router.get('/mynotes', requiresLogin, function(req, res, next) {
	var user = req.session.user;
	Folder.fromUserId(user._id, function(err, folders) {
		if (err) return next(err);
		return res.render('mynotes', {
			email: user.email,
			folders: folders
		});
	});
});

/* GET request for note page */
router.get('/note', requiresLogin, function(req, res, next) {
	var user = req.session.user;
	return res.render('note', {
		email: user.email
	});
});

/* GET request for account settings page */
router.get('/settings', requiresLogin, function(req, res, next) {
	var user = req.session.user;
	return res.render('settings', {
		email: user.email
	});
});

/* POST request to login */
router.post('/login', function(req, res, next) {
	if (req.body.email && req.body.password) {
		User.authenticate(req.body.email, req.body.password, function(err, user) {
			if (err) return next(err);
			req.session.user = user;
			return res.redirect('/mynotes');
		});
	}
});

/* POST request to create a new user */
router.post('/newuser', function(req, res, next) {
	if (req.body.email && req.body.password && req.body.confirmedPassword && req.body.password === req.body.confirmedPassword) {
		User.create({
			email: req.body.email,
			password: req.body.password
		}, function(err, user) {
			if (err) return next(err);
			req.session.user = user;
			return res.redirect('/mynotes');
		});
	}
});

/* GET request to logout */
router.get('/logout', function(req, res, next) {
	if (req.session) {
		req.session.destroy(function(err) {
			if (err) return next(err);
			return res.redirect('/');
		});
	}
});

module.exports = router;
