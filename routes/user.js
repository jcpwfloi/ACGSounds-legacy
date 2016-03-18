var router = require('express').Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({uploadDir: __dirname + '/../tmp'});
var Sheet = require('../model/sheet');
var User = require('../model/user');
var Qiniu = require('../model/qiniu');
var Step = require('step');
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

router.get('/profile/:name', function (req, res) {
    User.find({username: req.params.name}, function (err, doc) {
        if (err) {
            res.status(400);
            res.render('error', { message: JSON.stringify(err) } );
        } else if (!doc || doc.length === 0) {
            res.status(404);
            res.render('error', { message: 'User not found' } );
        } else {
            res.render('profile', {
                title: req.__('User Profile') + ' - ACGSounds',
                targ_user: {
                    _id: doc[0]._id,
                    username: doc[0].username,
                    email: doc[0].email
                }
            });
        }
    });
});

router.post('/sheetlist/:user_id', function(req, res) {
    Sheet.find({user: req.params.user_id}, function (err, doc) {
        if (err) {
            res.status(400);
            res.json(err);
        } else {
            res.json(doc);
        }
    });
});


router.get('*', function(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/user/login?callback=' + '/user' + req.url);
});

router.get('/', function(req, res) {
    res.render('user', {
        title: req.__('User Center') + ' - ACGSounds'
    });
});

router.get('/upload', function(req, res) {
    res.render('upload', {
        title: req.__('Upload Sheets' + '- ACGSounds')
    });
});

router.post('/upload', multipartMiddleware, function(req, res) {
    delete req.body._csrf;

    req.body.sheetTag = req.body.sheetTag.replace(/，/g, ",");
    req.body.sheetTag = req.body.sheetTag.replace(/\ ,/g, ",");
    req.body.sheetTag = req.body.sheetTag.replace(/,\ /g, ",");
    
    req.body.sheetTag = req.body.sheetTag.split(',');

    req.body.user = req.session.user._id;
    req.body.approved = 0;

    var sheet = new Sheet(req.body);
    sheet.save(function(err) {
        if (err) {
            res.render('error', { message: JSON.stringify(err) } );
            fs.unlinkSync(req.files.pdf.path);
            fs.unlinkSync(req.files.midi.path);
            return;
        }
        Sheet.findOne(req.body, function(err, sheet) {
            Step(function() {
                Qiniu.upload(req.files.pdf.path, sheet._id + '.pdf', this.parallel());
                Qiniu.upload(req.files.midi.path, sheet._id + '.mid', this.parallel());
            }, function(err, res1, res2, res3) {
                fs.unlinkSync(req.files.pdf.path);
                fs.unlinkSync(req.files.midi.path);
                res.send('提交成功等待审核');
            });
        });
    });
});

module.exports = router;
