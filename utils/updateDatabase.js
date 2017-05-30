const mongoose = require('mongoose');
const Comment = require('../model/comment');
const Sheet = require('../model/sheet');

mongoose.connect('mongodb://127.0.0.1/acgs_sheet');

async function work () {
  var result = await Sheet.find().populate('comments');

  result.map((sheet) => {
    if (sheet.comments && sheet.comments.length) {
      sheet.comments.map((comment) => {
        console.log(comment);
        Comment.update({_id: comment._id}, {$set: {sheet: sheet._id}}, (err, doc) => {
          console.log(doc);
        });
        return comment;
      });
    }
    return sheet;
  });
  
  return 'success';
}

work().then((doc) => {
  console.log(doc);
});
