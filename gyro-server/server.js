const fs = require("fs");
const https = require("https");
const express = require("express");
const { Server } = require("socket.io");

const app = express();

app.use(express.static("public"));

// 🔐 HTTPS options
const options = {
  key: fs.readFileSync("./certs/key.pem"),
  cert: fs.readFileSync("./certs/cert.pem"),
};

// create HTTPS server
const httpsServer = https.createServer(options, app);
const io = new Server(httpsServer);

let latestState = {
  alpha: 0,
  beta: 0,
  gamma: 0,
};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("state:update", latestState);

  socket.on("gyro:data", (data) => {
    latestState = data;
    io.emit("state:update", latestState);
  });
});

// IMPORTANT: HTTPS PORT
httpsServer.listen(3000, () => {
  console.log("HTTPS server running at https://localhost:3000");
});
