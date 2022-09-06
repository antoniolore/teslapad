const express = require('express');
const app = express();
app.use(express.static(__dirname + '/js'));

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/display.html');
});

app.get('/pad', (req, res) => {
    res.sendFile(__dirname + '/pad.html');
});

io.on('connection',(socket) => {
    var currentRoom = null;
    const userId = socket.id

    function joinRoom(socket, room) {
        socket.leave(currentRoom)
        currentRoom = null;
        socket.join(room);
        currentRoom = room;
    }

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('display', (msg) => {
        var command = msg.split("#")

        if (command[0] == 'join') {
            joinRoom(socket, command[1])

            io.to(currentRoom).emit('display', 'connected');
            console.log("display connected")
        } else {
            console.log("unknown command: " + command)
        }
    });

    socket.on('pad', (msg) => {
        var command = msg.split("#")

        if (command[0] == 'join') {
            joinRoom(socket, command[1])

            io.to(currentRoom).emit('pad', 'pad connected');
            console.log("pad connected")
        } else {
            console.log("unknown command: " + command)
        }
    });

    socket.on('chat', (msg) => {
        if (currentRoom != null) {
            io.to(currentRoom).emit('chat', msg);
        } else {
            io.to(userId).emit('chat', "you didn't join yet");
        }
    });


});

server.listen(3000, () => {
    console.log('listening on *:3000');
});