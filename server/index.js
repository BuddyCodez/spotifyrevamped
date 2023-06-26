var express = require('express');
var app = express();
var server = require('http').createServer(app);
const QueueManger = require('./QueueManger');
var io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(express.static(__dirname + '/node_modules'));
app.get('/', (req, res) => {
    res.json({ message: 'Socket Running' })
})
server.listen(4200, () => {
    console.log('Server is running on port 4200\n url: http://localhost:4200');
})
const users = new Map();
const Queue = new QueueManger();
const connectedUsers = [];
io.on('connection', function (client) {

    if (Queue.isPlaying()) {
        console.log("Queue already Playing...");
        io.to(client.id).emit('setPlaying', Queue.getCurrent());
        io.to(client.id).emit('queue', Queue.getQueue());
        // io.to(connectedUsers[0].id).emit('getCurrentTime');
    }
    console.log('Client connected...');
    io.on('disconnect', function (data) {
        console.log('Client disconnected...');
        Queue.DestroyQueue();
        connectedUsers.filter((user) => user.id !== client.id);
        console.log("connectedUsers", connectedUsers);
    });
    client.on('join', function (data, callback) {
        const { name } = data?.user;
        const connectedUser = { id: client.id, name };
        const userTofind = connectedUsers.find((user) => user.id === client.id || user.name == name);
        if (userTofind) return;
        connectedUsers.push(connectedUser);
        console.log("connectedUsers", connectedUsers);
        client.emit('users', connectedUsers);
        console.log(`${data.user.name} joined Room.`);
        callback(connectedUsers);
    });
    client.on('addsong', (data) => {
        console.log(`Song added to queue: ${data.title} by ${data.by.name}`);
        Queue.addSong(data);
        io.emit('queue', Queue.getQueue());
    })
    client.on('queueAdded', (data) => {
        console.log("Queue Added..")
        const isplaying = Queue.isPlaying();
        console.log("isplaying:", isplaying);
        const playing = data?.playing;
        if (!isplaying || !playing) {
            console.log("Playing..");
            Queue.play();
            Queue.setCurrentSong(Queue.queue[0]);
            io.emit("setPlaying", Queue.getCurrent());
            io.emit('play', true);
        }
    })
    client.on("Buffered", (data, callback) => {
        callback(data);
    });
    client.on("NextPlay", (data) => {
        Queue.removeFirst();
        Queue.setCurrentSong(Queue.queue[0]);
        io.emit('queue', Queue.getQueue());
        io.emit("NewPlayed", Queue.getCurrent());
    })
    client.on("getUsers", (data, callback) => {
        callback(users);
    })
    client.on("seek", (data) => {
        console.log("Seeking to:", data + " seconds");
        io.emit("seekto", data);
    })

});
