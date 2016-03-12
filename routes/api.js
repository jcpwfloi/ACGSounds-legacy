var router = require('express').Router();

var Sheet = require('../model/sheet');
var User = require('../model/user');
var Comment = require('../model/comment');

/**
 * Search API v0.1
 * @param {String} req.body.current query page
 * @param {String} req.body.querystring query strying of search
 * @return {JSON Object}
 */
router.post('/search', function(req, res) {
    var ret = {current: req.body.current ? req.body.current : 1};
    var str = req.body.querystring;

    Sheet.find().or([ { sheetName: { $regex: str }, approved: 3 }, { sheetTag: { $regex: str }, approved: 3 }]).count(function(err, count) {
        Sheet.find().or([ { sheetName: { $regex: str }, approved: 3 }, { sheetTag: { $regex: str }, approved: 3 }]).exec(function(err, sheet) {
            ret.data = sheet;
            ret.total = Math.floor(count / 20) + 1;
            res.json(ret);
        });
    });
});

/**
 * Login API v1.0
 * @param {String} req.body.username username
 * @param {String} req.body.password MD5 Encrypted Password
 * @return {JSON Object} error or success
 */
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

/**
 * Register API v1.0
 * @param {JSON Object} req.body username, password, email
 * @return {JSON Object} error or success
 *  if duplicate, return 400
 *  for other errors, return 400
 *  unknown errors, return 500
 *  else return success
 */
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
// `sheet_id` should be provided in request body.
router.post('/comment/list', function (req, res) {
    Sheet.find({ _id: req.body.sheet_id }).populate({
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
                    isLiked: (req.session.user.commentLikes.indexOf(cmt._id.toString()) !== -1)
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
// `sheet_id` and `text` should be provided in request body.
router.post('/comment/create', function (req, res) {
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
            Sheet.update({ _id: req.body.sheet_id }, { $push: { 'comments': comment._id } }, function (err) {
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
    var ret = { msg: 'Not processed. Unknown error QAQ' };
    var callback = function (err) {
        User.findOne({ _id: req.session.user._id }, function (err, user) {
            req.session.user = user;
            res.json(ret);
        });
    };
    if (req.session.user.commentLikes.indexOf(req.body.id) !== -1) {
        // Dad-tricking > <
        // http://stackoverflow.com/q/15748660/
        Comment.update({ _id: req.body.id }, { $inc: { 'likeCount': -1 } }, function (err) { });
        User.update({ _id: req.session.user._id }, { $pull: { 'commentLikes': req.body.id } }, callback);
        ret = { operation: 'cancel', msg: 'Success' };
    } else {
        Comment.update({ _id: req.body.id }, { $inc: { 'likeCount': 1 } }, function (err) { });
        User.update({ _id: req.session.user._id }, { $push: { 'commentLikes': req.body.id } }, callback);
        ret = { operation: 'like', msg: 'Success' };
    }
});

module.exports = router;

