import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import connectToDb from './config/db.js';

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join', (data) => {
        if (data.userType === 'user') {
            socket.join(`user-${data.userId}`);
        } else if (data.userType === 'driver') {
            socket.join(`driver-${data.driverId}`);
        }
    });

    socket.on('update-location-driver', (data) => {
        // Broadcast location to specific user if ride is ongoing
        if (data.rideId) {
            io.to(`user-${data.userId}`).emit('driver-location', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const start = (port: number) => {
    connectToDb();
    server.listen(port, "0.0.0.0", () => {
        console.log(`Backend server running on port ${port}`);
    });
    return server;
}

export default start;
