import { Server } from 'socket.io';

// Create a new instance of Socket.IO server
// Map to store users and their queue data
const users = new Map();

// Socket.IO connection event


const SocketHandler = (req, res) => {
    if (res.socket.server.io) {
        console.log('Socket is already running');
    } else {
        const io = new Server(res.socket.server, {
            path: "/api/socket_io",
            addTrailingSlash: false
        });
        HandleIo(io);
        res.socket.server.io = io;
    }
    res.end();
};
function HandleIo(io) {
    io.on('connection', (socket) => {
        console.log('Socket connected');
        console.log('User connected with id:', socket.id);

        // Join the "listeningSession" room
        socket.join('listeningSession');

        // Handle "listeningSession" event
        socket.on('listeningSession', (data) => {
            console.log('listeningSession', data);
            users.set(socket.id, data);

            // Emit updated queue to all connected clients
            io.to('listeningSession').emit('queueUpdated', Array.from(users.values()));
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected with id:', socket.id);
            users.delete(socket.id);

            // Emit updated queue to all connected clients
            io.to('listeningSession').emit('queueUpdated', Array.from(users.values()));
        });
    });
}
export default SocketHandler;
