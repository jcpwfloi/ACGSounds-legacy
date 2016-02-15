var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('list', {
        title: req.__('Search')
    })
});

router.get('/:text', function(req, res) {
    res.render('list', {
        title: req.__('Search') + ' - ' + req.params.text,
        text: req.params.text
    })
});

module.exports = router;
