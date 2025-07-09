import express from "express";
const app = express();
import http from "http";
import { Server } from "socket.io";
// Load environment variables
import path from "path"
import dotenv from "dotenv";
import ACTIONS from "./src/Actions.js";
import { fileURLToPath } from "url";
dotenv.config();
const server = http.createServer(app);

const io = new Server(server);



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static('dist'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
const userSocketMap = {};// This map is storing key value of client socket_id ->username



function getAllConnectedClients(roomId) {   //   (1)  io.sockets.adapter.rooms.get(roomId) it gives a map storing all clients id of that particular room id 
    // (2) we are converting that map to an array consists of client id 
    // (3)apply map on that array we get 
    // (4) returning a array of objects where an object contain client id and username (we got username from the map above we declared)
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on("connection", (socket) => {
  // console.log("socket conneted", socket.id);

  // 🎯 WHAT HAPPENS WHEN A USER JOINS A ROOM

socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    // 📥 STEP 1: Listen for JOIN request from client
    // When a user clicks "Join Room" on frontend, this code runs
    // Client sends: { roomId: "room123", username: "john_doe" }
    
    // 📝 STEP 2: Remember this user in our database
    userSocketMap[socket.id] = username;
    // Think of this like a phonebook: "Socket abc123 belongs to john_doe"
    // userSocketMap = { "abc123": "john_doe", "def456": "jane_doe" }
    
    // 🚪 STEP 3: Put this user in the room
    socket.join(roomId);
    // Like moving someone into a chat room - now they can hear room messages
    
    // 👥 STEP 4: Get list of everyone currently in this room
    const clients = getAllConnectedClients(roomId);
    // This function returns something like:
    // [
    //   { socketId: "abc123", username: "john_doe" },
    //   { socketId: "def456", username: "jane_doe" }
    // ]
    
    // 📢 STEP 5: Tell EVERYONE in the room that someone new joined
    clients.forEach(({ socketId }) => {
        // 🎯 Send message to each person individually
        io.to(socketId).emit(ACTIONS.JOINED, {
            clients,        // 👥 Updated list of all users in room
            username,       // 🆕 Name of person who just joined
            socketId: socket.id, // 🔗 Socket ID of person who joined
        });
    });

});


      socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    // console.log('receiving from client', code);
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    // console.log('sending to other clients in room', roomId);
});




    
socket.on(ACTIONS.LANGUAGE_CHANGE, ({ roomId, language, code }) => {
  //console.log('Language change received:', { roomId, language, code });
  
  // Broadcast language change to all other clients in the room
  socket.in(roomId).emit(ACTIONS.LANGUAGE_CHANGE, { 
    language, 
    code 
  });
});

// Also update your SYNC_CODE handler to include language
socket.on(ACTIONS.SYNC_CODE, ({ code, language, socketId }) => {
  //console.log('Syncing code and language:', { code, language, socketId });
  
  // Send current code and language to the specific client
  io.to(socketId).emit(ACTIONS.CODE_CHANGE, code);
  if (language) {
    io.to(socketId).emit(ACTIONS.LANGUAGE_CHANGE, { language, code });
  }
});

// 🚀 NEW: Handle code execution results broadcasting
socket.on(ACTIONS.CODE_EXECUTION, ({ roomId, result, isError, executedBy }) => {
  console.log('Code execution result received:', { roomId, isError, executedBy });
  
  // Broadcast execution result to ALL clients in the room (including sender)
  // This ensures everyone sees the same output
  io.to(roomId).emit(ACTIONS.CODE_OUTPUT, {
    result,
    isError,
    executedBy,
    timestamp: new Date().toISOString()
  });
});


 // 🔌 Listen for the 'disconnecting' event
// This is triggered **just before** the socket is disconnected (i.e., user leaves or closes tab)
socket.on('disconnecting', () => {
    
    // 🧠 STEP 1: Get all rooms the user is part of
    // `socket.rooms` is a Set of all room IDs the socket is in (including its own ID)
    const rooms = [...socket.rooms];

    // 🔁 STEP 2: Loop through each room and notify other users
    rooms.forEach((roomId) => {
        // 🚨 Send a 'DISCONNECTED' event to everyone else in the room
        // Let them know this user (with socketId & username) is leaving
        socket.in(roomId).emit(ACTIONS.DISCONNECTED, {  // It notify other sockets who are present in room except itself
            socketId: socket.id,
            username: userSocketMap[socket.id],
        });
    });

    // 🧽 STEP 3: Clean up - remove the user's entry from the map
    // They're no longer connected, so we don't need to store their username anymore
    delete userSocketMap[socket.id];

    // 🚪 STEP 4: Leave all rooms
    // Good practice to ensure cleanup (optional here, since socket will auto-leave on disconnect)
    socket.leave();
});
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
<<<<<<< Updated upstream
});
=======
});
>>>>>>> Stashed changes
