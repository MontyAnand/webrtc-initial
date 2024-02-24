const express = require("express");
const PORT = process.env.PORT || 5000;
// const NodeCache = require( "node-cache" );
// const liveRooms = new NodeCache({ stdTTL: 60, checkperiod: 120 });
const path = require('path');
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
const server = http.createServer(app);
const set = new Set();

const io = new Server(server, {
    cors: {
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket)=>{
    console.log("New connection");
    socket.emit("message", "Hello client");

    socket.on("join",(room)=>{
      socket.join(room);
      if(set.has(room)){
        socket.to(room).emit("alert", socket.id);
      }
      else {
        set.add(room);
      }
    });

    socket.on("offer", ({room,offer})=>{
        console.log(offer);
        socket.to(room).emit("offer",offer);
    });

    socket.on("answer", ({room, answer})=>{
      socket.to(room).emit("answer",answer);
    })
});

server.listen(3000,()=>{
    console.log("Server is running");
})