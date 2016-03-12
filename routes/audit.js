var express = require('express');
var router = express.Router();

var Sheet = require('../model/sheet');

router.get('/', function(req, res) {
    Sheet.find({ approved: 0 })
    .populate({ path: 'user' })
    .sort({_id: -1})
    .select('sheetName approved')
    .exec(function(err, doc) {
        res.render('audit', {
            title: '审核 - ACGSounds'
        })
    });
});

module.exports = router;
