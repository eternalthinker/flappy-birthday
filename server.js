/*
 * Node server for simple authentication
 *
 * Author: Rahul Anand [ eternalthinker.co ], Jan 2015
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
*/

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

function checkAuth(req, res, next) {
    console.log("Checking auth");
    if (!req.session.userid) {
        res.redirect('/login');
    } else {
        // Prevent caching of secret page
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

    if (post.secret) { // Form submission
        if (post.secret === 'secret') { // Login passed
            req.session.userid = "1111";
            res.send("pass");
        } else { // Login failed
            console.log("Fail");
            res.send("fail");
        }
    } else { // Direct access or Redirection
        if (req.session.userid) { // Already logged in (rare)
            res.redirect('/');
        } else { // Fresh access
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

// Accessible without login, for sake of sharing in login page
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/fonts', express.static(__dirname + '/fonts'));

app.use('/', checkAuth, express.static(__dirname)); // Goto login (rare) or show game
app.get('*', function (req, res, next) { // Handle wildcards gracefully
    res.redirect('/');
}); 

app.listen(process.env.PORT || 8080);

console.log("Flappy server started at port " + (process.env.PORT || "8080"));
