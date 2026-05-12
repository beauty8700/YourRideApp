import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (userId: string) => {
    if (!socket) {
        // Connect to backend server
        const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
        socket = io(backendUrl);

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
