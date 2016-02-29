var express = require('express');
var router = express.Router();

var Sheet = require('../model/sheet');

router.get('/', function(req, res) {
});

router.get('/:id', function(req, res) {
    Sheet.findOne({_id: req.params.id}, function(err, sheet) {
        if (sheet) {
            res.locals.title = '查看乐谱 - ' + sheet.sheetName;
            res.render('sheet', { sheet: sheet });
        } else res.render('error');
    });
});

module.exports = router;
