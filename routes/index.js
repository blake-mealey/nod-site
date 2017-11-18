var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/nod');

var User = require('../schemas/User.js')

// Connect to db
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {		// Test DB connection
	console.log('Connected successfully!');
});

// Middleware function to require a session user id to load the page
// Renders 'require-login' if not logged in
function requiresLogin(req, res, next) {
	if (req.session && req.session.userId) {
		return next();
	} else {
		return res.render('require-login');
	}
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
	User.fromId(req.session.userId, function(err, user) {
		if (err) return next(err);
		var notes = [
			{
				name: 'Note 4',
				id: '3',
				modified: 'Nov 2, 2017'
			},
			{
				name: 'Note 3',
				id: '2',
				modified: 'Oct 31, 2017'
			},
			{
				name: 'Note 2',
				id: '1',
				modified: 'Sep 15, 2017'
			},
			{
				name: 'Note 1',
				id: '0',
				modified: 'Sep 5, 2017'
			}
		];
		var folders = [
			{
				name: 'History Notes 1',
				notes: notes
			},
			{
				name: 'History Notes 2',
				notes: notes
			},
			{
				name: 'History Notes 3',
				notes: notes
			},
			{
				name: 'History Notes 4',
				notes: notes
			},
			{
				name: 'History Notes 5',
				notes: notes
			}
		];
		return res.render('mynotes', {
			email: user.email,
			folders: folders		// TODO: from db
		});
	});
});

/* GET request for note page */
router.get('/note', requiresLogin, function(req, res, next) {
	User.fromId(req.session.userId, function(err, user) {
		if (err) return next(err);
		return res.render('note', {
			email: user.email
		});
	});
});

/* GET request for account settings page */
router.get('/settings', requiresLogin, function(req, res, next) {
	User.fromId(req.session.userId, function(err, user) {
		if (err) return next(err);
		return res.render('settings', {
			email: user.email
		});
	});
});

/* POST request to login */
router.post('/login', function(req, res, next) {
	if (req.body.email && req.body.password) {
		User.authenticate(req.body.email, req.body.password, function(err, user) {
			if (err) return next(err);
			req.session.userId = user._id;
			return res.redirect('/mynotes');
		});
	}
});

/* POST request to create a new user */
router.post('/newuser', function(req, res, next) {
	if (req.body.email && req.body.password) {
		var userData = {
			email: req.body.email,
			password: req.body.password
		};

		User.create(userData, function(err, user) {
			if (err) return next(err);
			return res.redirect('/');
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
