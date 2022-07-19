const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {origin: '*'}
});
var nodemon = require('nodemon');

server.listen(3000, () => console.log('Server listening on port ' + 3000));

userArray = [];

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
        io.emit('users', userArray);
        io.emit('my-socket-id', socket.id)
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

    socket.on('disconnect', data => {
        console.log('disconnect - '+ socket.id);
        var index = userArray.map(object => object.id).indexOf(socket.id)
        if( index != -1) {
            userArray[index].online = false;
            io.emit('users', userArray)
        }
    });

});