var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    // TODO: Redirect to mynotes if signed in
    res.render('splash', {});
});

router.get('/signup', function(req, res, next) {
    res.render('signup', {});
});

router.get('/mynotes', function(req, res, next) {
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
    res.render('mynotes', {
    	folders: folders
    });
});

router.get('/note', function(req, res, next) {
    res.render('note', {});
});

router.get('/settings', function(req, res, next) {
    res.render('settings', {});
});

module.exports = router;
