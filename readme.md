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

### For players

http://localhost:5000/?roomID=2&playerID=2

## Additional Information

Player Disconnection Handling: If a player disconnects from the game, the remaining player is declared the winner.

If only single player is connected then his game is connected with bot.
If you see error running index.js file then run -npx playwright install- and run the server again.
Rename .env.example to .env and update variables
Make sure to update base url in .env file and scrips/globals.js file
URL=<base-url> (.env)
var Link = <base-url> (scrips/globals.js)
