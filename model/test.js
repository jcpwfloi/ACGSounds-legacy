var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/test');

var Sheet = require('./sheet');

var sheet = new Sheet({sheetName: 'shit', sheetTag: ['f', 1, new Date]});

sheet.save();
