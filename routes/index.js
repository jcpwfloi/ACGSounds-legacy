var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('index', { title: req.__('ACGSounds Sheets') });
});

router.get('/contributors', function(req, res) {
    res.render('contributors', { title: req.__('Contributors') });
});

module.exports = router;
