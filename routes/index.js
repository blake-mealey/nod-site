var express = require('express');
var router = express.Router();

var moment = require('moment');
var bcrypt = require('bcrypt');

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
            Folder.findByIdAndUpdate(folderId, {
                $push: { notes: note }
            }, function(err, updatedFolder) {
                if (err) return res.redirect('/mynotes');
                return res.redirect('/note?id=' + note.id);
            });
        });
    } else if (req.query.id) {
        // Find the note (contents)
        Note.findById(req.query.id, function(err, note) {
            if (err) return res.redirect('/mynotes');
            
            // Find the note in its folder (metadata)
            Folder.findOne({
                'notes.id': note._id
            }, 'notes.$ _id name userId', function(err, folder) {
                if (err) return res.redirect('/mynotes');

                // Users cannot access other user's notes!
                // TODO: Sharing?
                if (folder.userId != user._id) return res.redirect('/mynotes');

                var internalNote = folder.notes[0].toObject();
                internalNote.content = note.content;
                internalNote.folderId = folder._id;
                internalNote.folderName = folder.name;

                // Get a list of all the user's folders
                Folder.find({
                    userId: user._id
                }, '_id name', function(err, folders) {
                    if (err) return res.redirect('/mynotes');

                    // Put the note's folder at the top
                    // TODO: Sort by recently used (add folder last used property)
                    for (var i = 0; i < folders.length; i++) {
                        var folder = folders[i];
                        if (String(folder._id) == internalNote.folderId) {
                            folders.splice(i, 1);
                            folders.splice(0, 0, folder);
                            break;
                        }
                    }

                    return res.render('note', {
                        email: user.email,
                        note: internalNote,
                        folders: folders
                    });
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
            Folder.create({
                name: "Default Folder",
                userId: user._id,
                notes: []
            }, function (err, folder) {
                if (err) return err;
                User.findByIdAndUpdate(user._id,
                    {
                        defaultFolderId: folder._id
                    }, function (err, updatedUser) {
                        if (err) return err;
                        req.session.user = updatedUser;
                        req.session.user.defaultFolderId = folder._id;
                        return res.redirect('/mynotes');
                });
            });
        });
    } else {
        return res.redirect('/signup');
    }
});

/* GET request to logout */
router.get('/users/logout', function(req, res, next) {
    if (req.session) {
        req.session.destroy(function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    } else {
        return res.redirect('/');
    }
});

router.post('/users/edit', requiresLogin, function(req, res, next) {
    var user = req.session.user;
    if (req.body.email || req.body.password) {
        var updates = {};
        if (req.body.email) updates.email = req.body.email;
        if (req.body.password) updates.password = bcrypt.hashSync(req.body.password, 10);
        User.findByIdAndUpdate(user._id, updates, function(err) {
            if (err) return next(err);
            if (req.body.email) user.email = req.body.email;
            return res.redirect('/settings');
        });
    } else {
        return res.redirect('/settings');
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
            userId: user._id,			// User can only edit their own folders
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
            'userId': user._id,				// User can only edit their own notes
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

router.post('/notes/move-folder', requiresLogin, function(req, res, next) {
    var user = req.session.user;
    if (req.body.noteId && req.body.folderId) {
        Folder.findOne({
            'userId': user._id,				// User can only edit their notes/folders
            'notes.id': req.body.noteId
        }, 'notes.$', function(err, folder) {
            if (err) return res.send({ ok: false, err: err });
            var note = folder.notes[0].toObject();
            folder.update({
                $pull: { notes: { id: req.body.noteId } }
            }, function(err) {
                if (err) return res.send({ ok: false, err: err });
                Folder.update({
                    userId: user._id,		// User can only edir their notes/folders
                    _id: req.body.folderId
                }, {
                    $push: { notes: note }
                }, function(err) {
                    if (err) return res.send({ ok: false, err: err });
                    return res.send({ ok: true });
                });
            });
        });
    } else {
        return res.send({ ok: false, err: 'missing_params' });
    }
});

module.exports = router;
