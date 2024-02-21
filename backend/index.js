const http = require('http');
const { Server } = require('socket.io');
const express = require('express');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

let connectedUsers = [];
let text = ''; // Store the text in a variable

io.on("connection", (socket) => {
    console.log(`User connected with ID: ${socket.id}`);

    // Add the user to the connected users list
    connectedUsers.push({ id: socket.id, name: `User ${connectedUsers.length + 1}` });

    // Emit the updated list of connected users to all clients
    io.emit('users', connectedUsers);

    socket.emit('text updated', text); // Send the current text to the newly connected user

    socket.on('text update', (newText) => {
        text = newText; // Update the text with the new value
        io.emit('text updated', newText); // Broadcast the new text to all connected users
    });

    socket.on('disconnect', () => {
        console.log(`User with ID ${socket.id} disconnected`);

        // Remove the disconnected user from the connected users list

        connectedUsers = connectedUsers.filter(user => user.id !== socket.id);

        // Emit the updated list of connected users to all clients

        io.emit('users', connectedUsers);
    });
});


const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

