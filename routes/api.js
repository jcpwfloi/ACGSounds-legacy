var router = require('express').Router();

var Sheet = require('../model/sheet');

router.post('/search', function(req, res) {
    var ret = {
        current: req.body.current ? req.body.current : 1
    };

    var str = req.body.querystring;

    Sheet.find().or([ { sheetName: { $regex: str } }, { sheetTag: { $regex: str } }/*, { sheetIntro: { $regex: str } }*/ ]).count(function(err, count) {
        Sheet.find().or([ { sheetName: { $regex: str } }, { sheetTag: { $regex: str }}/*, { sheetIntro: { $regex: str } }*/ ]).exec(function(err, sheet) {
            ret.data = sheet;
            ret.total = Math.floor(count / 20) + 1;
            res.json(ret);
        });
    });

    /*
    Sheet.count( { sheetName: new RegExp(req.body.querystring) }, function(err, count) {
        Sheet.find( { sheetName: new RegExp(req.body.querystring) }, function(err, sheet) {
            ret.data = sheet;
            ret.total = count / 20 + 1;
            res.json(ret);
        });
    });*/

});

module.exports = router;

