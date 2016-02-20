var router = require('express').Router();

var Sheet = require('../model/sheet');

router.post('/search', function(req, res) {
    var ret = {
        current: 1,
        total: 1
    };

    Sheet.find(function(err, sheet) {
        ret.data = sheet;
        
        res.json(ret);
    });
});

module.exports = router;

