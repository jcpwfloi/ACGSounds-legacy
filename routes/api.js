var router = require('express').Router();

var Sheet = require('../model/sheet');
var User = require('../model/user');

router.post('/search', function(req, res) {
    var ret = {current: req.body.current ? req.body.current : 1};
    var str = req.body.querystring;

    Sheet.find().or([ { sheetName: { $regex: str } }, { sheetTag: { $regex: str } }]).count(function(err, count) {
        Sheet.find().or([ { sheetName: { $regex: str } }, { sheetTag: { $regex: str }}]).exec(function(err, sheet) {
            ret.data = sheet;
            ret.total = Math.floor(count / 20) + 1;
            res.json(ret);
        });
    });
});

router.post('/register', function(req, res) {
    var user = new User(req.body);
    var error = user.validateSync();
    if (error) {
        res.status(400);
        return res.json(error);
    } else {
        user.save();
        res.json({msg: 'Success'});
    }
});

module.exports = router;

