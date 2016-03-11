var router = require('express').Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({uploadDir: __dirname + '/../tmp'});
var Sheet = require('../model/sheet');
var fs = require('fs');

router.get('/login', function(req, res) {
    res.render('login', {
        title: req.__('Login')
    });
});

router.get('/logout', function(req, res) {
    req.session.user = null;
    res.redirect('back');
});

router.get('/register', function(req, res) {
    res.render('register', {
        title: req.__('Register')
    });
});

router.get('*', function(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/user/login?callback=' + '/user' + req.url);
});

router.get('/upload', function(req, res) {
    res.render('upload', {
        title: req.__('Upload Sheets' + '- ACGSounds')
    });
});

router.post('/upload', multipartMiddleware, function(req, res) {
    delete req.body._csrf;

    var sheet = new Sheet(req.body);
    sheet.save(function(err) {
        Sheet.findOne(req.body, function(err, sheet) {
            fs.rename(req.files.pdf.path, __dirname + '/../tmp/' + sheet._id + '.pdf', function(err) {
                fs.rename(req.files.midi.path, __dirname + '/../tmp/' + sheet._id + '.mid', function(err) {
                    res.send('提交成功等待审核');
                });
            });
        });
    });
});

module.exports = router;
