var router = require('express').Router();

router.get('/', function(req, res) {
    res.render('lab', {title: '实验室'});
});

module.exports = router;
