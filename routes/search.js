var express = require('express');
var router = express.Router();

router.get('/:text', function(req, res) {
    res.send(req.params.text);
});

module.exports = router;
