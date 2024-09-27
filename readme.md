# Getting Started

# Step 1

```bash
npm i
```

# Step 2

```bash
npx playwright install
```

# Step 3

Run the server

```bash
npm run start
```


## Important Information

Player Disconnection Handling: If a player disconnects from the game, the remaining player is declared the winner.

If you see error running index.js file then run -npx playwright install- and run the server again.
Rename .env.example to .env and update variables
Make sure to update base url in .env file
URL=<base-url> (.env)
Uncomment line 276 to line 283 and line 304 to line 311
Remove line 274 and 302
