var express = require('express');
var router = express.Router();

var Sheet = require('../model/sheet');

router.use('*', function(req, res, next) {
    if (req.session.user && (req.session.user.audit || req.session.user.admin)) {
        next();
    } else {
        res.status(403);
        res.render('error', { message: '木有权限' })
    }
});

router.get('/', function(req, res) {
    Sheet.find({ approved: 0 })
    .populate({ path: 'user' })
    .sort({_id: -1})
    .select('sheetName approved')
    .exec(function(err, doc) {
        res.render('audit', {
            title: '审核 - ACGSounds',
            sheet: doc
        })
    });
});

router.post('/submit', function(req, res) {
    Sheet.update({_id: req.body.id}, {$set: { approved: req.body.type === 'approved' ? 3 : 2 }, $push: { auditor: req.session.user._id, auditDate: new Date }}, function(err, doc) {
        res.json({message: '成功'});
    });
});

router.get('/:id', function(req, res) {
    Sheet.findOne({_id: req.params.id}, function(err, sheet) {
        res.render('sheet', {
            title: '审核预览',
            sheet: sheet
        });
    });
});

module.exports = router;

