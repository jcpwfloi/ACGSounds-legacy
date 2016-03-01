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

router.get('*', function(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/user/login');
});

module.exports = router;
