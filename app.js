var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./user');
var session = require("express-session"),
    bodyParser = require("body-parser");

var connections = [];

app.use(express.static('public'));
app.use(session({ secret: 'not so secret secret'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done){
        User.findOne({username:username}, function(err, res){
            if(err) {
                console.log(err);
                return done(err);
            }
            var user = new User.User(res.username, res.password);
            user.id = res._id;

            if(!user || !user.validPassword(password)) {
                return done(null, false, {message: "invalid username or password"});
            }

            return done(null, user);
        });
    }
));

app.post('/register', function(req, res){
    var user = new User.User(req.body.username, req.body.password);
    User.insertOne(user, (err, res)=>{

    });
    res.redirect('/');
});

app.post('/login', passport.authenticate('local',
    {
        successRedirect: '/chat/',
        failureRedirect: '/'
    })
);

app.get('/', function(req, res){
    res.sendFile(__dirname + "/pages/login.html");
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/sign-up', function(req, res){
    res.sendFile(__dirname + "/pages/register.html");
});

app.use('/static', express.static(__dirname + "/static/"));

app.get('/chat', function(req, res){
    if(req.isAuthenticated()) {
        res.sendFile(__dirname + "/pages/chat.html");
    }else {
        res.redirect('/');
    }
});



io.on('connection', function(socket){
    console.log("A user connected");
    socket.broadcast.emit('join', socket.id + ",-1,-1");
    for(var i = 0; i < connections.length; i++){
        var con = connections[i];
        socket.emit('join', con.id + "," + con.x + "," + con.y);
    }
    connections.push({id:socket.id, x: 1280/2 - 25/2, y: (720/2) - (25/2)});



    socket.on('update', function(message){
        socket.broadcast.emit('update', message+","+socket.id);
    });

    socket.on('disconnect', function(){
        for(var i = 0; i < connections.length; i++){
            if(connections[i].id === socket.id){
                connections.splice(i, 1);
                break;
            }
        }
        socket.broadcast.emit('leave', socket.id);
    });
});

http.listen(8080);