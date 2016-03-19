var router = require('express').Router();

var Sheet = require('../model/sheet');
var User = require('../model/user');
var Comment = require('../model/comment');
var CommentUpvote = require('../model/comment-upvote');

/**
 * Search API v0.1
 * @param {String} req.body.current query page
 * @param {String} req.body.querystring query strying of search
 * @return {JSON Object}
 */

var perPage = 20;

router.post('/search', function(req, res) {
    var ret = {current: req.body.current ? req.body.current : 1};
    var page = ret.current;
    var str = req.body.querystring;

    Sheet.find({ approved: 3} ).or([ { sheetName: { $regex: str } }, { sheetTag: { $regex: str } }]).count(function(err, count) {
        Sheet.find({ approved: 3 })
        .or([ { sheetName: { $regex: str } }, { sheetTag: { $regex: str } }])
        .sort({_id: -1})
        .limit(perPage)
        .skip(perPage * (page - 1))
        .populate({ path: 'user', model: 'User', select: 'username'})
        .exec(function(err, sheet) {
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

/**
 * Comment list API v1.0
 * @param {String} req.body.sheet_id  The object ID of the sheet
 * @param {String} req.body.start  The index of the first comment to retrieve
 * @param {String} req.body.count  The number of the comments to retrieve,
 *                                 i.e. the returned JSON contains comments [start .. start + count - 1]
 * @return {JSON Object}  A `msg` field denoting the result, and `count` and `list` (matching the requirements of Pagination) on success
 */
router.post('/comment/list', function (req, res) {
    Sheet.find({ _id: req.body.sheet_id }).populate({
        path: 'comments',
        populate: { path: 'author', model: 'User', select: 'username email' }
    }).exec(function (err, sheet) {
        if (!sheet || sheet.length === 0) return res.json([]);
        var start = parseInt(req.body.start);
        var count = parseInt(req.body.count);
        if (isNaN(start) || isNaN(count)) return res.json({ msg: 'Invalid start / count argument' });
        if (start + count > sheet[0].comments.length) count = sheet[0].comments.length - start;
        var ret = [];
        var likeDataRetrieved = 0;
        for (var i = start; i < start + count; ++i) {
            var cmt = sheet[0].comments[i];
            if (!cmt) continue;
            ret.push({
                _id: cmt._id,
                createdAt: cmt.createdAt,
                author: cmt.author,
                text: cmt.text,
                likeCount: cmt.likeCount
            });
            if (req.session.user) {
                CommentUpvote.findOne({ user: req.session.user._id, comment: cmt._id }, (function (_ret, _i) { return function (err, record) {
                    if (record) _ret[_i].isLiked = true;
                    else _ret[_i].isLiked = false;
                    if (++likeDataRetrieved === count) res.json({ msg: 'Okay', count: sheet[0].comments.length, list: _ret });
                }; })(ret, ret.length - 1));
            }
        }
        if (!req.session.user) return res.json({ msg: 'Okay', count: sheet[0].comments.length, list: ret });
    });
});

/**
 * Comment send API v1.0
 * @param {String} req.body.sheet_id  The object ID of the sheet
 * @param {String} req.body.text  The text to be sent
 * @return {JSON Object}  A `msg` field denoting the result
 */
router.post('/comment/create', function (req, res) {
    if (!req.session.user) {
        res.status(403);
        return res.json({ msg: 'Please log in first  = =' });
    } else if (req.body.text.length > 500) {
        res.status(403);
        return res.json({ msg: 'Content exceeds maximum length (500 characters).' });
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

/**
 * Comment like/unlike API v1.0
 * 
 * Toggles the upvote state of a given comment. Only valid when the user is logged in.
 * 
 * @param {String} req.body.sheet_id  The object ID of the comment
 * @return {JSON Object}  A `msg` field denoting the result, and `operation` representing the operation carried out ('like' or 'cancel').
 */
router.post('/comment/like', function (req, res) {
    if (!req.session.user) {
        res.status(403);
        return res.json({ msg: 'Please log in first  = =' });
    }
    var ret = { msg: 'Not processed. Unknown error QAQ' };
    var cond = { user: req.session.user._id, comment: req.body.id };
    CommentUpvote.findOneAndRemove(cond, function (doc, record) {
        if (record) {
            Comment.update({ _id: req.body.id }, { $inc: { 'likeCount': -1 } }, function (err) { });
            ret = { operation: 'cancel', msg: 'Success' };
        } else {
            Comment.update({ _id: req.body.id }, { $inc: { 'likeCount': 1 } }, function (err) { });
            var upvoteRec = new CommentUpvote(cond);
            upvoteRec.save();
            ret = { operation: 'like', msg: 'Success' };
        }
        res.json(ret);
    });
});

module.exports = router;

