var bestscore = 0;
var storageKey = 'rf.knife-shot';
var firstLoad = true;
var bgTexture = 'bg_sky';
var ROOM_ID = "";
var PLAYER_ID = "";
var IS_HOST = ""
var SHOW_GAMEPLAY = false
var CAN_PLAY = true
var START_EMITTING = false
var BOT_PLAY = false
var ignoreNextGlobalInput = false
var CAN_BOT_PLAY = true
// var LINK = `https://knife-game.onrender.com`
var LINK = `http://localhost:5000`

// loadData();
// function loadData() {
//     let localData = getData(storageKey);
//     if (localData) { //Load existing game data
//         bestscore = localData;
//     }
// }