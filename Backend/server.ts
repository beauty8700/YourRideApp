import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import connectToDb from "./config/db.js";
import backendApp from "./app.js";

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  app.use(backendApp);

  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  });

  const PORT = Number(process.env.PORT) || 3000;

  await connectToDb();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", (data) => {
      socket.join(data.userId || data.driverId);
    });

    socket.on("ride-request", (data) => {
      io.emit("new-ride-request", {
        ...data,
        socketId: socket.id,
      });
    });

    socket.on("accept-ride", (data) => {
      io.to(data.userSocketId).emit("ride-accepted", data);
    });

    socket.on("update-location", (data) => {
      if (data.rideId) {
        socket.broadcast.emit("driver-location-update", data);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup failed:", err);
});
