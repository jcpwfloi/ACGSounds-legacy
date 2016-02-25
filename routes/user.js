var router = require('express').Router();

router.get('/login', function(req, res) {
    res.render('login', {
        title: req.__('Login')
    });
});

router.get('/register', function(req, res) {
    res.render('register', {
        title: req.__('Register')
    });
});

module.exports = router;
