import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (identityId: string, role: 'user' | 'driver' = 'user') => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

    if (!socket) {
        socket = io(backendUrl);

        socket.on('connect', () => {
            console.log('Connected to socket server');
            socket?.emit('join', { identityId, role });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });
    } else if (socket.connected) {
        socket.emit('join', { identityId, role });
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

export const stopReceivingMessage = (event: string, callback?: (data: any) => void) => {
    if (!socket) {
        return;
    }

    if (callback) {
        socket.off(event, callback);
    } else {
        socket.off(event);
    }
};
