# Getting Started

Install all dependencies

```bash
npm i
```

Run the server

```bash
npm run start
```

Following is the example how the URL parameters should be passed for host and for other players

### For Host

http://localhost:5000/?roomID=2&playerID=1&playerName=abc&numOfPlayers=2&isHost=true

### For other players

http://localhost:5000/?roomID=2&playerID=2&playerName=john

## Additional Information

Player Disconnection Handling: If a player disconnects from the game, the remaining player is declared the winner.

If only single player is connected then he will always lose against the bot.
