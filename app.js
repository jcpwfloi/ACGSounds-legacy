var express = require('express');
var i18n = require('i18n');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var csurf = require('csurf');
var session = require('express-session');

require('mongoose').connect('mongodb://hk2.codebursts.com/acgs_sheet');

var routes = require('./routes/index');
var search = require('./routes/search');
var api = require('./routes/api');
var sheets = require('./routes/sheets');
var user = require('./routes/user');

var app = express();

i18n.configure({
    locales: ['zh', 'en'],
    directory: __dirname + '/locales'
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'iughp093478yoEFIUH',
    resave: false,
    saveUninitialized: true
}));
app.use(i18n.init);
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(require('express-uglify').middleware({src: path.join(__dirname, 'public')}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(csurf());

app.use(function(req, res, next) {
    /*
    res.locals.__ = res.__ = function() {
        return i18n.__.apply(req, arguments);
    };*/

    res.locals.csrf = req.csrfToken();
    res.locals.user = req.session.user;

    next();
});

app.use('/', routes);
app.use('/api', api);
app.use('/search', search);
app.use('/user', user);
app.use('/sheets', sheets);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
