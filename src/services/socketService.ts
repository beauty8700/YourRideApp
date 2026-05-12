import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (userId: string) => {
    if (!socket) {
        // The socket should connect to the same host that serves the page
        socket = io();

        socket.on('connect', () => {
            console.log('Connected to socket server');
            socket?.emit('join', { userId });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });
    }
    return socket;
};

export const getSocket = () => {
    return socket;
};

export const sendMessage = (event: string, data: any) => {
    if (socket) {
        socket.emit(event, data);
    }
};

export const receiveMessage = (event: string, callback: (data: any) => void) => {
    if (socket) {
        socket.on(event, callback);
    }
};
