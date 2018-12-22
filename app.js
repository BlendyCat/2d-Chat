var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var connections = [];

app.use('/static', express.static(__dirname + "/static/"));

app.get("/", function(req, res){
    res.sendFile(__dirname + "/pages/chat.html");
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