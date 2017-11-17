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
    res.render('mynotes', {});
});

router.get('/note', function(req, res, next) {
    res.render('note', {});
});

router.get('/settings', function(req, res, next) {
    res.render('settings', {});
});

module.exports = router;
