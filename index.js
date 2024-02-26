const express = require("express");
const PORT = process.env.PORT || 3000;
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

    socket.on("join",(data)=>{
      console.log(data.room,data.username);
      socket.join(data.room);
      if(set.has(data.room)){
        socket.to(data.room).emit("alert", data);
      }
      else {
        set.add(data.room);
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

server.listen(PORT,()=>{
    console.log("Server is running");
})