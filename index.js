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
    matchID: String,
    returnURL: String,
    token: String,
    players: [{
        playerID: String,
        socketID: String,
        connected: { type: Boolean, default: true },
        score: { type: Number, default: 0 },
        gameEnd: { type: Boolean, default: false }
    }],
    gameStarted: { type: Boolean, default: false },
    startTime: String,
    createdAt: { type: Date, default: Date.now },
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

    socket.on('joinRoom', async ({ emit, token, returnURL, matchId, playerID, player2ID }) => {
        if (emit) {
            let room = await Room.findOne({ roomID: matchId });

            if (room) {
                const originalPlayerID = playerID.slice(0, -4)

                let myPlayerObject = null;
                let otherPlayerObject = null;

                for (const player of room.players) {
                    if (player.playerID === originalPlayerID) {
                        myPlayerObject = { playerID: player.playerID };
                    } else {
                        otherPlayerObject = { playerID: player.playerID };
                    }
                }

                socket.join(matchId);
                io.in(matchId).emit('startGameWithEmit',
                    {
                        emittingPlayer: otherPlayerObject.playerID,
                        inGame: playerID
                    }
                );
            }

        } else {
            try {
                randomDelay(5, 10, async() => { 
                    let room = await Room.findOne({ roomID: matchId });
                    if (!room) {
                        room = new Room({
                            roomID: matchId,
                            matchID: matchId,
                            returnURL: returnURL,
                            token: token,
                            players: [{
                                playerID,
                                socketID: socket.id,
                                connected: true,
                                score: 0,
                                gameEnd: false
                            }],
                            gameStarted: false
                        });
                        await room.save();
                        socket.join(matchId);
                        if(player2ID){
                            if (player2ID.slice(0, 3) === "b99" || player2ID.slice(0, 3) === "a99") {
                                call_bot(`${process.env.URL}/?token=${token}&returnURL=${returnURL}&matchId=${matchId}&player1Id=${player2ID}&player2Id=${playerID}`, 75000)
                            }
                        }
                        
    
    
                    } else {
    
                        if (room.gameStarted) {
                            socket.emit('gameStarted', { message: 'Game has already started. You cannot join the room.' });
                            return;
                        }
    
                        const existingPlayer = room.players.find(p => p.playerID === playerID);
    
                        if (existingPlayer) {
                            existingPlayer.connected = true;
                            existingPlayer.socketID = socket.id;
                        } else {
                            room.players.push({
                                playerID,
                                socketID: socket.id,
                                connected: true,
                                score: 0,
                                gameEnd: false
                            });
                        }
    
                        await room.save();
                        socket.join(matchId);
    
                        const playersCount = room.players.filter(p => p.connected).length;
    
                        if (playersCount === 2) {
                            room.gameStarted = true;
                            room.startTime = new Date().getTime();
                            await room.save();
                            io.in(matchId).emit('startGame', {
                                link: process.env.URL
                            });
                        }
                    }
                });
               
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
            const { roomID, playerID } = data;
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

        io.in(data.roomID).emit('throw', data);
    });

    
    socket.on('emitTime', (data) => {
        io.in(data.roomID).emit('emitTime', data);
    });


    socket.on('emitGameEnd', (data) => {

        io.in(data.roomID).emit('emitGameEnd', data);
    });

    socket.on("gameFinished", async (data) => {
        const roomID = data.roomID;
        const playerID = data.playerID;
        const room = await Room.findOne({ roomID });
        if(room){
            let currentPlayer = room.players.find(player => player.playerID === playerID);
            let otherPlayer = room.players.find(player => player.playerID !== playerID);
            const url = room.returnURL
            const dataToSend = {
                "token": room.token,
                "event_type": "match_ended",
                "message": `${playerID} win`,
                "data": {
                    "event_type": "match_ended",
                    "datetime": new Date().toISOString(),
                    "winner": playerID,
                    "player1Score": currentPlayer?.score,
                    "player2Score": otherPlayer?.score
                }
            };
    
            await Room.deleteOne({ roomID });
    
            // try {
            //     await axios.post(url, dataToSend).then(async () => {
            //         await Room.deleteOne({ roomID });
            //     });
    
            // } catch (error) {
            //     console.log('Error sending game result:', error);
            // }
        }
        
    });

    socket.on("gameFinishedWithTie", async (data) => {
        const roomID = data.roomID;
        const room = await Room.findOne({ roomID });
        const url = room.returnURL
        const dataToSend = {
            "token": room.token,
            "event_type": "match_aborted",
            "message": `Match tie`,
            "data": {
                "event_type": "match_ended",
                "datetime": new Date().toISOString(),
                "error_code": "string",
                "error_description": "string"
            }
        };

        await Room.deleteOne({ roomID });

        // try {
        //     await axios.post(url, dataToSend).then(async () => {
        //         await Room.deleteOne({ roomID });
        //     });

        // } catch (error) {
        //     console.log('Error sending game result:', error);
        // }
    });

});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

async function call_bot(url, time) {

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForTimeout(time);
    await browser.close();
}

async function randomDelay(minSeconds, maxSeconds, callback) {
    const delay = Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds) * 1000;
    setTimeout(callback, delay);
}
