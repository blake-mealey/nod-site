var express = require('express');
var router = express.Router();

var moment = require('moment');

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
			folders: folders,
			moment: moment
		});
	});
});

/* GET request for note page */
router.get('/note', requiresLogin, function(req, res, next) {
	var user = req.session.user;
	if (req.query.new) {
		var name = 'Untitled note';
		var folderId = user.defaultFolderId;
		Note.create({}, function(err, doc) {
			if (err) return res.send({ ok: false, err: err });
			var note = {
				name: name,
				id: doc._id
			};
			Folder.update({
				_id: folderId
			}, {
				$push: { notes: note }
			}, function(err) {
				if (err) return res.redirect('/mynotes');
				return res.redirect('/note?id=' + note.id);
			});
		});
	} else if (req.query.id) {
		Note.findById(req.query.id, function(err, note) {
			if (err) return res.redirect('/mynotes');
			// Folder.fromUserId(user._id, function(err, folders) {
			// 	if (err) return next(err);

			// });
			Folder.findOne({
				'notes.id': note._id
			}, {
				'notes.$': 1
			}, function(err, folder) {
				if (err) return res.redirect('/mynotes');
				var internalNote = folder.notes[0].toObject();
				internalNote.content = note.content;
				return res.render('note', {
					email: user.email,
					note: internalNote
				});
			});
		});
	} else {
		return res.redirect('/mynotes');
	}
});

/* GET request for account settings page */
router.get('/settings', requiresLogin, function(req, res, next) {
	var user = req.session.user;
	return res.render('settings', {
		email: user.email
	});
});

/* POST request to login */
router.post('/users/login', function(req, res, next) {
	if (req.body.email && req.body.password) {
		User.authenticate(req.body.email, req.body.password, function(err, user) {
			if (err) return next(err);
			req.session.user = user;
			return res.redirect('/mynotes');
		});
	}
});

/* POST request to create a new user */
router.post('/users/new', function(req, res, next) {
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
router.get('/users/logout', function(req, res, next) {
	if (req.session) {
		req.session.destroy(function(err) {
			if (err) return next(err);
			return res.redirect('/');
		});
	}
});

/* POST request to create a new folder */
router.post('/folders/new', requiresLogin, function(req, res, next) {
	var user = req.session.user;
	console.log(req.body);
	if (req.body.name) {
		Folder.create({
			name: req.body.name,
			userId: user._id,
			notes: []
		}, function(err, folder) {
			if (err) return res.send({ ok: false, err: err });
			return res.send({ ok: true, id: folder._id });
		});
	} else {
		return res.send({ ok: false, err: 'missing_params' });
	}
});

/* POST request to edit an existing folder */
router.post('/folders/edit', requiresLogin, function(req, res, next) {
	var user = req.session.user;
	if (req.body.id && req.body.name) {
		Folder.update({
			_id: req.body.id
		}, {
			name: req.body.name
		}, function(err) {
			if (err) return res.send({ ok: false, err: err });
			return res.send({ ok: true });
		});
	} else {
		return res.send({ ok: false, err: 'missing_params' });
	}
});

router.post('/notes/edit-name', requiresLogin, function(req, res, next) {
	var user = req.session.user;
	if (req.body.id && req.body.name) {
		Folder.findOneAndUpdate({
			'notes.id': req.body.id
		}, {
			$set: {
				'notes.$.name': req.body.name
			}
		}, function(err, folder) {
			if (err) return res.send({ ok: false, err: err });
			return res.send({ ok: true });
		});
	} else {
		return res.send({ ok: false, err: 'missing_params' });
	}
});

module.exports = router;
