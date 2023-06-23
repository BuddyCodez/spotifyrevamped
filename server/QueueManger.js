class QueueManger {
    constructor() {
        this.queue = [];
        this.history = [];
        this.currentSong = null;
    }
    addSong(song) {
        this.queue.push(song);
    }
    removeSpecific(song) {
        this.queue = this.queue.filter(s => s.name !== song.name);
    }
    getQueue() {
        return this.queue;
    }
    getNextSong() {
        this.removeFirst();
        this.setCurrentSong(this.queue[0]);
        return this.queue[0];
    }
    removeFirst() {
        this.queue.shift();
    }
    clearQueue() {
        this.queue = [];
    }
    play() {
        this.playing = true;
    }
    pause() {
        this.playing = false;
    }
    isPlaying() {
        return this.playing;
    }
    getHistory() {
        return this.history;
    }
    addHistory(song) {
        this.history.push(song);
    }
    clearHistory() {
        this.history = [];
    }
    setCurrentSong(song) {
        if (this.currentSong) {
            this.addHistory(this.currentSong);
        }
        // this.queue.filter(s => s.videoId !== song.videoId);
        // console.log("Filtered Queue", this.queue)
        this.currentSong = song;
        console.log('Current song:', song);
    }
    getCurrent() {
        return this.currentSong;
    }
    filterQueue(user) {
        this.queue = this.queue.filter(s => s.by.name !== user.name);
    }
    DestroyQueue() {
        this.queue = [];
        this.currentSong = null;
    }

}
module.exports = QueueManger;