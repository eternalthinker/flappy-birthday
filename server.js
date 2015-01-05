
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

function checkAuth(req, res, next) {
    console.log("Checking auth");
    if (!req.session.userid) {
        res.redirect('/login');
    } else {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        next();
    }
}

var app = express();
app.use(session({
    secret: 'topsy kret',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/login', function (req, res, next) {
    console.log("Checking Login..");
    var post = req.body;

    if (post.secret) {
        if (post.secret === 'secret') { // logging in pass
            req.session.userid = "1111";
            res.send("pass");
        } else { // logging in fail
            console.log("Fail");
            res.send("fail");
        }
    } else {
        if (req.session.userid) { // already logged in - rare
            res.redirect('/');
        } else { // first access
            console.log("Init");
            express.static(__dirname + "/login")(req, res, next);
        }
    }
});

app.get('/logout', function (req, res, next) {
    console.log("Logout");
    delete req.session.userid;
    res.redirect('/login');
}); 

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/fonts', express.static(__dirname + '/fonts'));
app.use('/', checkAuth, express.static(__dirname)); // goto login (rare) or show game
app.get('*', function (req, res, next) {
    res.redirect('/');
}); 

app.listen(process.env.PORT || 8080);

console.log("Flappy server started at port " + (process.env.PORT || "8080"));
