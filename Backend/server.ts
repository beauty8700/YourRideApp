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

  const userSocketMap = new Map<string, string>();
  const driverSocketMap = new Map<string, string>();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", (data) => {
      const identityId = data.identityId || data.userId || data.driverId;
      const role = data.role || (data.driverId ? "driver" : "user");

      if (!identityId) {
        return;
      }

      socket.data.identityId = identityId;
      socket.data.role = role;
      socket.join(identityId);

      if (role === "driver") {
        driverSocketMap.set(identityId, socket.id);
      } else {
        userSocketMap.set(identityId, socket.id);
      }
    });

    socket.on("ride-request", (data) => {
      io.emit("new-ride-request", {
        ...data,
        socketId: socket.id,
      });
    });

    socket.on("accept-ride", (data) => {
      if (data.userId && userSocketMap.get(data.userId)) {
        io.to(userSocketMap.get(data.userId) as string).emit("ride-accepted", data);
        return;
      }

      if (data.userSocketId) {
        io.to(data.userSocketId).emit("ride-accepted", data);
      }
    });

    socket.on("ride-cancelled", (data) => {
      if (data.driverId && driverSocketMap.get(data.driverId)) {
        io.to(driverSocketMap.get(data.driverId) as string).emit("ride-cancelled", data);
      }

      if (data.userId && userSocketMap.get(data.userId)) {
        io.to(userSocketMap.get(data.userId) as string).emit("ride-cancelled", data);
      }
    });

    socket.on("ride-started", (data) => {
      if (data.userId && userSocketMap.get(data.userId)) {
        io.to(userSocketMap.get(data.userId) as string).emit("ride-started", data);
      }
    });

    socket.on("ride-completed", (data) => {
      if (data.userId && userSocketMap.get(data.userId)) {
        io.to(userSocketMap.get(data.userId) as string).emit("ride-completed", data);
      }
    });

    socket.on("update-location", (data) => {
      if (data.rideId) {
        socket.broadcast.emit("driver-location-update", data);
      }
    });

    socket.on("disconnect", () => {
      if (socket.data?.identityId && socket.data?.role === "driver") {
        driverSocketMap.delete(socket.data.identityId);
      }

      if (socket.data?.identityId && socket.data?.role === "user") {
        userSocketMap.delete(socket.data.identityId);
      }

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
