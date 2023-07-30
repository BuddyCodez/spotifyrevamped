class RoomQueue {
    constructor() {
        this.Room = new Map();
    }
    addRoom(roomCode) {
        this.Room.set(roomCode, {
            currentTime: 0,
            queue: [],
            history: [],
            currentSong: null,
            playing: false,
            members: [],
            host: '',
        });
    }
    setMembers(roomCode, members) {
        this.Room.get(roomCode).members = members;
    }
    getMembers(roomCode) {
        return this.Room.get(roomCode).members || [];
    }
    setHost(roomCode, host) {
        this.Room.get(roomCode).host = host;
    }
    getHost(roomCode) {
        return this.Room.get(roomCode).host;
    }
    addSong(roomCode, song) {
        this.Room.get(roomCode).queue.push(song);
    }
    removeSpecific(roomCode, song) {
        this.Room.get(roomCode).queue = this.Room.get(roomCode).queue.filter(s => s.title !== song.title);
    }
    getQueue(roomCode) {
        return this.Room.get(roomCode).queue;
    }
    removeFirst(roomCode) {
        this.Room.get(roomCode).queue.shift();
    }
    setCurrentSong(roomCode, song) {
        if (this.Room.get(roomCode).currentSong) {
            this.addHistory(roomCode, this.Room.get(roomCode).currentSong);
        }
        this.Room.get(roomCode).currentSong = song;
        console.log('Current song:', song);
    }
    setCurrentTime(roomCode, time) {
        this.Room.get(roomCode).currentTime = time;
    }
    getCurrentTime(roomCode) {
        return this.Room.get(roomCode)?.currentTime || 0;
    }
    getCurrent(roomCode) {
        return this.Room.get(roomCode)?.currentSong || null;
    }
    getPlaying(roomCode) {
        return this.Room.get(roomCode)?.playing || false;
    }
    addHistory(roomCode, song) {
        this.Room.get(roomCode).history.push(song);
    }
    clearHistory(roomCode) {
        this.Room.get(roomCode).history = [];
    }
    getHistory(roomCode) {
        return this.Room.get(roomCode).history || [];
    }
    play(roomCode) {
        this.Room.get(roomCode).playing = true;
    }
    clearQueue(roomCode) {
        this.Room.get(roomCode).queue = [];
    }
    getNextSong(roomCode) {
        this.removeFirst(roomCode);
        this.setCurrentSong(roomCode, this.Room.get(roomCode).queue[0]);
        return this.Room.get(roomCode).queue[0];
    }

}

module.exports = RoomQueue;
// class QueueManger {
//     constructor() {
//         this.queue = [];
//         this.history = [];
//         this.currentSong = null;
//     }
//     addSong(song) {
//         this.queue.push(song);
//     }
//     removeSpecific(song) {
//         this.queue = this.queue.filter(s => s.name !== song.name);
//     }
//     getQueue() {
//         return this.queue;
//     }
//     getNextSong() {
//         this.removeFirst();
//         this.setCurrentSong(this.queue[0]);
//         return this.queue[0];
//     }
//     removeFirst() {
//         this.queue.shift();
//     }
//     clearQueue() {
//         this.queue = [];
//     }
//     play() {
//         this.playing = true;
//     }
//     pause() {
//         this.playing = false;
//     }
//     isPlaying() {
//         return this.playing;
//     }
//     getHistory() {
//         return this.history;
//     }
//     addHistory(song) {
//         this.history.push(song);
//     }
//     clearHistory() {
//         this.history = [];
//     }
//     setCurrentSong(song) {
//         if (this.currentSong) {
//             this.addHistory(this.currentSong);
//         }
//         // this.queue.filter(s => s.videoId !== song.videoId);
//         // console.log("Filtered Queue", this.queue)
//         this.currentSong = song;
//         console.log('Current song:', song);
//     }
//     getCurrent() {
//         return this.currentSong;
//     }
//     filterQueue(user) {
//         this.queue = this.queue.filter(s => s.by.name !== user.name);
//     }
//     DestroyQueue() {
//         this.queue = [];
//         this.currentSong = null;
//     }

// }
// module.exports = QueueManger;