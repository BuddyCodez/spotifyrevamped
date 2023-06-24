// SocketContext.js

import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // fetch("http://localhost:4200");
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL); // Replace with your Socket.IO server URL
        setSocket(newSocket);
        console.log("Socket Connected.");
        return () => {
            newSocket.disconnect();
        }
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
