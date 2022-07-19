const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {origin: '*'}
});
const mysql = require('mysql');

const connection =  mysql.createConnection({
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "chatapp-node"
});
connection.connect( function(err){
    console.log(err);
})

server.listen(3000, () => console.log('Server listening on port ' + 3000));

userArray = [];
userNewArray = [];
messageArray = []

io.on('connection', (socket) => {
    console.log('user connected');
    // should call this emit. 
    io.emit('users', userArray)
    // io.emit('my-socket-id', socket.id)

    // join the room
    socket.on('join', data => {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit('new user',{username: data.username, message: " has joined the room" });
        userArray.push({username: data.username, id: socket.id, online: true });
        userNewArray[data.username] = socket.id
        console.log(userArray)
        console.log(userNewArray)
        io.emit('users', userArray);
        io.emit('my-socket-id', socket.id);
    });

    // leave the room
    socket.on('leave', data => {
        socket.leave(data.room);
        socket.broadcast.to(data.room).emit('leave user',{username: data.username, message: " has left the room" });
    });

    // send message to the rooms
    socket.on('message', data => {
        io.in(data.room).emit('new message',{username: data.username, message: data.message });
    });

    // send message to the private user
    socket.on('message-to-private-user', data => {
        // console.log("private message - ", data);
        var socketId = userNewArray[data.receiver];
        io.to(socketId).emit('message-to-private-user',{sender: data.sender, receiver: data.receiver, message: data.message });
        messageArray.push({sender: data.sender, receiver: data.receiver, message: data.message });
        console.log(messageArray);
        io.emit('messageArray-to-private-user', messageArray);

        // sql query 
        connection.query(`INSERT INTO messages (sender, receiver, message) VALUES('${data.sender}', '${data.receiver}', '${data.message}')`, 
        function(err, res){
            if(err){
                console.log(err)
            }
            console.log(res)
        })
    });

    socket.on('disconnect', data => {
        console.log('disconnect - '+ socket.id);
        var index = userArray.map(object => object.id).indexOf(socket.id)
        if( index != -1) {
            userArray[index].online = false;
            io.emit('users', userArray)
        }
    });

});