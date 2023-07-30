var express = require('express');
var app = express();
var server = require('http').createServer(app);
const { user } = require('@nextui-org/react');
const RoomQueue = require('./QueueManger');
var io = require('socket.io')(server, {
    cors: {
        origin: "*",
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
const parseDuration = (duration) => {
    const parts = duration.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};
const RoomCodes = [];
const RQueue = new RoomQueue();
const GeneareRoomCode = () => {
    // Genrate a 4 Digit Room Code.
    const min = 1000;
    const max = 9999;
    const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;
    if (RoomCodes.includes(randomCode)) {
        return GeneareRoomCode();
    }
    return randomCode;
}
io.on('connection', function (client) {
    console.log('Client connected...');
    client.on('generateRoomCode', function (data, callback) {
        console.log("Gc ", data);
        const roomCode = GeneareRoomCode();
        RoomCodes.push(roomCode);
        RQueue.addRoom(roomCode);
        callback(roomCode);
    });
    client.on('joinRoom', function (data) {
        let roomCode;
        try {
            roomCode = Number(data.roomCode);
        } catch (e) {
            console.log(e);
        }
        if (!RoomCodes.includes(roomCode)) {
            client.emit("JoinResponse", { error: "Room Not Found" });
            return;
        }
        const User = data.user;
        const userToFind = RQueue.getMembers(roomCode).find((user) => user.email === User.email) || null;
        const user = {
            id: client.id,
            ...User,
        }
        if (userToFind) {
            userToFind.id = client.id;
            userToFind.roomcode = roomCode;
            client.emit("JoinResponse", userToFind);
            return;
        }
        RQueue.setMembers(roomCode, [...RQueue.getMembers(roomCode), user]);
        if (data?.host) {
            RQueue.setHost(roomCode, data.host);
        }
        const connectedUsers = RQueue.getMembers(roomCode);
        client.join(roomCode);
        // console.log(connectedUsers);
        client.emit("JoinResponse", {
            members: connectedUsers,
            code: roomCode,
            host: RQueue.getHost(roomCode),
        });
    });
    client.on("RoomMembers", function (data, callback) {
        try {
            const roomCode = data.roomCode;
            if (!RoomCodes.includes(roomCode)) {
                callback({ error: "Room Not Found" });
                return;
            }
            const connectedUsers = RQueue.getMembers(roomCode);
            callback(connectedUsers);
        } catch (error) {
            console.error(error);
        }
    });
    client.on('seekTo', function (data) {
        const roomCode = Number(data.code);
        const percent = Number(data.percent);
        const song = RQueue.getCurrent(roomCode);
        if (!song) return;
        console.log("Code", roomCode);
        const time = (parseDuration(song?.duration) * percent) / 100;
        RQueue.setCurrentTime(roomCode, time);
        io.to(roomCode).emit("PlayerState", {
            currentTime: RQueue.getCurrentTime(roomCode)
        })
    });
    client.on("getPlayer", function (data, callback) {
        const roomCode = Number(data?.code);
        const song = RQueue.getCurrent(roomCode);
        console.log(RQueue.getPlaying(roomCode));
        console.log("RoomCode:", roomCode);
        if (RQueue.getPlaying(roomCode)) {
            console.log(roomCode, client.id);
            io.to(roomCode).emit("PlayerState", {
                currentTime: RQueue.getCurrentTime(roomCode),
                currentSong: song,
                playing: RQueue.getPlaying(roomCode),
                queue: RQueue.getQueue(roomCode),
            })
        }
    });
    client.on('updateTime', function (data) {
        if (!data?.code) {
            // console.log("No Code Found");
            return;
        }
        const roomCode = Number(data.code);
        const time = Number(data.time);
        RQueue.setCurrentTime(roomCode, time);
    });
    client.on('queueAction', function (data) {
        console.log(data);
        const { code, action } = data;
        const song = data?.song || null;
        const roomCode = Number(code);
        switch (action) {
            case "addSong":
                RQueue.addSong(roomCode, song);
                if (!RQueue.getCurrent(roomCode) && RQueue.getQueue(roomCode).length === 1) {
                    RQueue.setCurrentSong(roomCode, song);
                    RQueue.play(roomCode);
                    console.log("Room:", roomCode);
                    console.log("Playing State:", RQueue.getPlaying(roomCode));
                }
                io.to(roomCode).emit("PlayerState", {
                    queue: RQueue.getQueue(roomCode),
                    currentSong: RQueue.getCurrent(roomCode),
                    history: RQueue.getHistory(roomCode),
                    playing: RQueue.getPlaying(roomCode),
                });
                break;
            case "removeSong":
                RQueue.removeFirst(roomCode);
                io.to(roomCode).emit("PlayerState", {
                    queue: RQueue.getQueue(roomCode),
                    currentSong: RQueue.getCurrent(roomCode),
                    history: RQueue.getHistory(roomCode),
                    playing: RQueue.getPlaying(roomCode),
                });
                break;
            case "nextSong":
                RQueue.removeFirst(roomCode);
                RQueue.setCurrentSong(roomCode, RQueue.getQueue(roomCode)[0]);
                io.to(roomCode).emit("PlayerState", {
                    queue: RQueue.getQueue(roomCode),
                    currentSong: RQueue.getCurrent(roomCode),
                    history: RQueue.getHistory(roomCode),
                    playing: RQueue.getPlaying(roomCode),
                    nextsong: true
                });
            default:
                io.to(roomCode).emit("PlayerState", {
                    queue: RQueue.getQueue(roomCode),
                    currentSong: RQueue.getCurrent(roomCode),
                    playing: RQueue.getPlaying(roomCode),
                });
                break;
        }
    });

});
io.on('disconnect', function (data) {
    console.log('Client disconnected...');
    Queue.DestroyQueue();
    connectedUsers.filter((user) => user.id !== client.id);
    console.log("connectedUsers", connectedUsers);
});

    // client.on('join', function (data, callback) {
    //     // console.log("Joining..");
    //     const name = data.name;
    //     const email = data.email;
    //     const image = data.image;
    //     const type = data.type;
    //     let role = data.role;
    //     if (type === "unkown") {
    //         let randomstr = Math.random().toString(36).substring(7);
    //         name = randomstr;
    //     }
    //     const connectedUser = { id: client.id, name, email, image, type, role };
    //     const userTofind = connectedUsers.find((user) => user.id === client.id || user.name == name);
    //     if (userTofind) return;
    //     connectedUsers.push(connectedUser);
    //     console.log("connectedUsers", connectedUsers);
    //     client.emit('users', connectedUsers);
    //     console.log(`${data.name} joined Room.`);
    //     callback(connectedUsers);
    // });