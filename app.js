var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const fairytale = require("./routes/fairytale");
const user = require("./routes/user");
const author = require("./routes/author");
const admin = require("./routes/admin");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Our Custom Donation Web App Routes
app.get('/fairytale', fairytale.findAllFairytale);
app.get('/fairytale/like', fairytale.findTotalLike);
app.get('/fairytale/:id', fairytale.findOne);

app.get('/user', user.findAllUser);
app.get('/user/:uname', user.findOne);

//app.get('/author/search/:aname', author.searchAuthor);
app.get('/author', author.findAllAuthor);
app.get('/author/:aname', author.findOne);

app.get('/admin', admin.findAllAdmin);
app.get('/admin/:id', admin.findOne);


app.post('/fairytale',fairytale.addFairytale);

app.post('/user/register',user.register);
app.post('/user/login',user.login);

app.post('/author',author.addAuthor);

app.post('/admin/register',admin.register);
app.post('/admin/login',admin.login);

app.put('/fairytale/:id/like', fairytale.incrementLikes);

app.delete('/fairytale/:id', fairytale.deleteFairytale);
app.delete('/author/:id', author.deleteAuthor);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

dotenv.config()
const uri = `${process.env.MONGO_URI}${process.env.MONGO_DB}`
console.log(uri)
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

var db = mongoose.connection

db.on('error', (err) => {
    console.log('connection error', err)
})
db.once('open', function () {
    console.log('connected to database')
})



module.exports = app;
