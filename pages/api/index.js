// Import necessary modules and packages
import { Server } from 'socket.io';

const io = new Server();

// Create a Socket.IO room for the queue
io.on('connection', (socket) => {
    socket.join('queueRoom');

    // Listen for 'queueUpdated' events from clients and broadcast to other clients in the room
    socket.on('queueUpdated', (updatedQueue) => {
        io.to('queueRoom').emit('queueUpdated', updatedQueue);
    });

    // Listen for 'pausePlayback' events from clients and broadcast to other clients in the room
    socket.on('pausePlayback', () => {
        io.to('queueRoom').emit('pausePlayback');
    });

    // ... Other socket event listeners ...
});

// Attach the Socket.IO server to the HTTP server
httpServer.on('upgrade', (request, socket, head) => {
    io.handleUpgrade(request, socket, head);
});

httpServer.listen(PORT, () => {
    console.log(`Socket.IO server listening on port ${PORT}`);
});

// ... Other server setup code ...
