const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const { Server } = require('socket.io');
const { chromium } = require('playwright'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'your_mongodb_uri';

app.use(express.static(path.join(__dirname)));

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const roomSchema = new mongoose.Schema({
    roomID: String,
    players: [{
        playerID: String,
        socketID: String,
        connected: { type: Boolean, default: true },
        score: { type: Number, default: 0 },
        isHost: { type: String, default: false },
        gameEnd: { type: Boolean, default: false }
    }],
    gameStarted: { type: Boolean, default: false },
    startTime: String,
    createdAt: { type: Date, default: Date.now },
    botPlay: { type: Boolean, default: false }
});

let gameStatePlayer1 = {
    targetRotation: 0,
    stuckKnives: [],
    bonusInGame: [],
    currentLevel: 0,
    score: 0,
};

const Room = mongoose.model('Room', roomSchema);

io.on('connection', (socket) => {

    socket.on('joinRoom', async ({ roomID, playerID, isHost, emit }) => {
      
        if (emit) {
            let room = await Room.findOne({ roomID });
            const originalPlayerID = playerID.split("-")[0]

            let myPlayerObject = null;
            let otherPlayerObject = null;

            for (const player of room.players) {
                if (player.playerID === originalPlayerID) {
                    myPlayerObject = { playerID: player.playerID };
                } else {
                    otherPlayerObject = { playerID: player.playerID };
                }
            }
         
            socket.join(roomID);
            io.in(roomID).emit('startGameWithEmit',
                {
                    emittingPlayer: otherPlayerObject.playerID,
                    inGame: playerID
                }
            );
        } else {
            try {
                let room = await Room.findOne({ roomID });
        
                if (!room) {
                    // Room does not exist, create a new room and join it
                    room = new Room({
                        roomID,
                        players: [{
                            playerID,
                            socketID: socket.id,
                            connected: true,
                            isHost: false, // First player to join is not the host
                            score: 0,
                            gameEnd: false
                        }],
                        gameStarted: false
                    });
                    await room.save();
                    socket.join(roomID);
        
                    // Set timeout to call bot if no second player joins
                    setTimeout(async () => {
                        room = await Room.findOne({ roomID });
                        const playersCount = room.players.filter(p => p.connected).length;
                        if (playersCount === 1 && !room.gameStarted) {
                            call_bot(`${process.env.URL}/?roomID=${roomID}&playerID=b${room.players[0].playerID}`, 120000);
                        }
                    }, 30000); // Adjust the timeout period as needed
        
                } else {
                    // Room exists
                    if (room.gameStarted) {
                        socket.emit('gameStarted', { message: 'Game has already started. You cannot join the room.' });
                        return;
                    }
        
                    // Join the room
                    const existingPlayer = room.players.find(p => p.playerID === playerID);
        
                    if (existingPlayer) {
                        // Player already exists, reconnect them
                        existingPlayer.connected = true;
                        existingPlayer.socketID = socket.id;
                    } else {
                        // New player joining the room
                        room.players.push({
                            playerID,
                            socketID: socket.id,
                            connected: true,
                            isHost: false,
                            score: 0,
                            gameEnd: false
                        });
                    }
        
                    await room.save();
                    socket.join(roomID);
        
                    // Check if the number of players has reached 2
                    const playersCount = room.players.filter(p => p.connected).length;
        
                    if (playersCount === 2) {
                        room.gameStarted = true;
                        room.startTime = new Date().getTime();
                        await room.save();
                        io.in(roomID).emit('startGame');
                    } else {
                        io.in(roomID).emit('waiting', { playersCount });
                    }
                }
            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('joinRoomError', { message: 'Error joining room. Please try again.' });
            }
        }
    });

    socket.on('playerDisconnectData', async () => {
        const room = await Room.findOne({ 'players.socketID': socket.id });
        if (room) {
            io.in(room.roomID).emit('playerWin');

        }
    });

    socket.on("movePlayed", async (data) => {
        try {
            const { roomID, playerID, score } = data;
            let room = await Room.findOne({ roomID });
            if (!room) {
                socket.emit('error', { message: 'Room not found.' });
                return;
            }
            let playerToUpdate = room.players.find(player => player.playerID === playerID);
            if (playerToUpdate) {
                playerToUpdate.score = score;
                io.in(roomID).emit("realTimeScore", { playerID: playerID, score: score })
                await room.save();
            } else {
                socket.emit('error', { message: 'Player not found.' });
            }
        } catch (error) {
            console.error('Error updating score:', error);
            socket.emit('error', { message: 'Error updating score. Please try again.' });
        }
    });

    socket.on("gameEnd", async (data) => {
        try {
            const { roomID, playerID, score } = data;
            let room = await Room.findOne({ roomID });
            if (!room) {
                socket.emit('error', { message: 'Room not found.' });
                return;
            }
            let playerToUpdate = room.players.find(player => player.playerID === playerID);
            let otherPlayer = room.players.find(player => player.playerID !== playerID);
            if (playerToUpdate) {
                playerToUpdate.gameEnd = true;
                await room.save();
                if (otherPlayer.gameEnd) {
                    let data = {
                        player1: playerToUpdate.playerID,
                        player1Score: playerToUpdate.score,
                        player2: otherPlayer.playerID,
                        player2Score: otherPlayer.score
                    }
                    io.in(roomID).emit('bothGameEnd', data);

                } else {
                    let data = {
                        playerID: playerToUpdate.playerID,
                    }
                    // io.in(roomID).emit('showGameOtherPlayer', data);
                }
            } else {
                io.in(roomID).emit('error', { message: 'Player not found.' });
            }
        } catch (error) {
            console.error('Error updating score:', error);
            io.in(data.roomID).emit('error', { message: 'Error updating score. Please try again.' });
        }
    });

    socket.on('updateState', (updatedState) => {
        gameStatePlayer1 = { ...gameStatePlayer1, ...updatedState };
        io.in(updatedState.roomID).emit('syncState', gameStatePlayer1);
    });


    socket.on('newLevel', (data) => {

        io.in(data.roomID).emit('newLevel', data);
    });

    socket.on('scoreUpdate', (data) => {

        io.in(data.roomID).emit('scoreUpdate', data);
    });


    socket.on('runningUpdate', (data) => {

        io.in(data.roomID).emit('runningUpdate', data);
    });

    socket.on('botPlayFinish', (data) => {

        io.in(data.roomID).emit('botPlayFinish');
    });

    socket.on('throw', (data) => {

        io.in(data.roomID).emit('throw');
    });

    socket.on('emitGameEnd', (data) => {

        io.in(data.roomID).emit('emitGameEnd');
    });

    socket.on('knifeCollision', (data) => {

        io.in(data.roomID).emit('knifeCollision');
    });

    socket.on("gameFinished", async (data) => {
        // console.log(data)
        // const roomID = data.roomID;
        // const playerID = data.playerID;
        // const room = await Room.findOne({ roomID });
        // const startTime = room.startTime;

        // const url = 'https://us-central1-html5-gaming-bot.cloudfunctions.net/callbackpvpgame';
        // const sign = 'EvzuKF61x9oKOQwh9xrmEmyFIulPNh';

        // const mydata = {
        //     gameUrl: 'knife',
        //     method: 'win',
        //     roomID: roomID,
        //     winnerID: playerID,
        //     timeStart: startTime
        // };

        // try {
        //     await axios.post(url, mydata, {
        //         headers: {
        //             'sign': sign
        //         }
        //     }).then(async () => {
        //         await Room.deleteOne({ roomID });
        //     });

        // } catch (error) {
        //     console.log('Error sending game result:', error);
        // }
    });

});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

async function call_bot ( url, time ) {
   
    const browser = await chromium.launch({ headless: true }); 
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForTimeout(time );  
    await browser.close();
}
