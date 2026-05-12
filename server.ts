import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import connectToDb from "./Backend/config/db.js";
import backendApp from "./Backend/app.js";

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  
  // Use our structured backend app for all /api routes
  app.use(backendApp);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // MongoDB Connection
  await connectToDb();

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", (data) => {
      socket.join(data.userId || data.driverId);
    });

    socket.on("ride-request", (data) => {
      io.emit("new-ride-request", { ...data, socketId: socket.id });
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
