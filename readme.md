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
Uncomment line 283 to line 290 and line 313 to line 320 (for production)  
Comment line 281 and 311 
