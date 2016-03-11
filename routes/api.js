var router = require('express').Router();

var Sheet = require('../model/sheet');
var User = require('../model/user');

router.post('/search', function(req, res) {
    var ret = {current: req.body.current ? req.body.current : 1};
    var str = req.body.querystring;

    Sheet.find().or([ { sheetName: { $regex: str }, approved: true }, { sheetTag: { $regex: str }, approved: true }]).count(function(err, count) {
        Sheet.find().or([ { sheetName: { $regex: str }, approved: true }, { sheetTag: { $regex: str }, approved: true }]).exec(function(err, sheet) {
            ret.data = sheet;
            ret.total = Math.floor(count / 20) + 1;
            res.json(ret);
        });
    });
});

router.post('/login', function(req, res) {
    delete req.body._csrf;
    User.findOne(req.body, function(err, user) {
        if (!user || user.password != req.body.password) {
            res.status(400);
            return res.json({error: 'EDATA'});
        } else {
            req.session.user = user;
            res.json({msg: 'Success'});
        }
    });
});

router.post('/register', function(req, res) {
    var user = new User(req.body);
    var error = user.validateSync();
    if (error) {
        res.status(400);
        return res.json(error);
    } else {
        user.save(function(err) {
            if (err) {
                res.status(400);
                return res.json(err);
            } else return res.json({msg: 'Success'});
        });
        req.session.user = user;
    }
});

module.exports = router;

