var router = require('express').Router();

var Sheet = require('../model/sheet');
var User = require('../model/user');
var Comment = require('../model/comment');

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

// Lists all the comments of a given sheet.
router.get('/comment/list/:sheet_id', function (req, res) {
    Sheet.find({ _id: req.params.sheet_id }).populate({
        path: 'comments',
        populate: { path: 'author', model: 'User', select: 'username' }
    }).exec(function (err, sheet) {
        if (req.session.user) {
            return res.json(sheet[0].comments.map(function (cmt) {
                return {
                    _id: cmt._id,
                    createdAt: cmt.createdAt,
                    author: cmt.author,
                    text: cmt.text,
                    likeCount: cmt.likeCount,
                    isLiked: (req.session.user.commentLikes.indexOf(cmt._id) !== -1)
                }
            }));
        } else {
            return res.json(sheet[0].comments.map(function (cmt) {
                return {
                    _id: cmt._id,
                    createdAt: cmt.createdAt,
                    author: cmt.author,
                    text: cmt.text,
                    likeCount: cmt.likeCount
                }
            }));
        }
    });
});

// Sends a comment on a sheet.
// `text` should be provided in request body.
router.post('/comment/create/:sheet_id', function (req, res) {
    if (!req.session.user) {
        res.status(403);
        return res.json({ msg: 'Please log in first  = =' });
    }
    var comment = new Comment({
        author: req.session.user._id,
        text: req.body.text,
        likeCount: 0
    });
    comment.save(function (err) {
        if (err) {
            res.status(400);
            return res.json(err);
        } else {
            Sheet.update({ _id: req.params.sheet_id }, { $push: { 'comments': comment._id } }, function (err) {
                if (err) {
                    res.status(400);
                    return res.json(err);
                } else {
                    return res.json({ msg: 'Success' });
                }
            });
        }
    });
});

// Like/Unlike(?) a comment.
// `id` should be provided in request body.
router.post('/comment/like', function (req, res) {
    if (!req.session.user) {
        res.status(403);
        return res.json({ msg: 'Please log in first  = =' });
    }
    var liked_list = req.session.user.commentLikes.map(function (e) { return e.toString(); });
    console.log(req.session.user.commentLikes);
    console.log(liked_list);
    if (req.session.user.commentLikes.indexOf(req.body.id) !== -1) {
        // Dad-tricking > <
        // http://stackoverflow.com/q/15748660/
        Comment.update({ _id: req.body.id }, { $inc: { 'likeCount': -1 } }, function (err) { });
        User.update({ _id: req.session.user._id }, { $pull: { 'commentLikes': req.body.id } }, function (err) { });
        return res.json({ operation: 'cancel', msg: 'Success' });
    } else {
        Comment.update({ _id: req.body.id }, { $inc: { 'likeCount': 1 } }, function (err) { });
        User.update({ _id: req.session.user._id }, { $push: { 'commentLikes': req.body.id } }, function (err) { });
        return res.json({ operation: 'like', msg: 'Success' });
    }
    User.find({ _id: req.session.user_id }, function (err, user) {
        req.session.user = user;
    });
});

module.exports = router;

