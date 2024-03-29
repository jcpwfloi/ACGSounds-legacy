var express = require('express');
var router = express.Router();

var Sheet = require('../model/sheet');

router.get('/:id', function(req, res) {
    Sheet.findOne({_id: req.params.id, approved: 3}).populate({
        path: 'user',
        model: 'User',
        select: 'username email'
    })
        .exec(function(err, sheet) {
        if (sheet) {
            res.locals.title = '查看乐谱 - ' + sheet.sheetName;
            res.render('sheet', { sheet: sheet });
        } else res.render('error', { message: 'Not Found' });
    });
});

module.exports = router;
