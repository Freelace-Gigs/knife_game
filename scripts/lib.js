//v1.0.6
var gameOptions = {
	sound: true,
	music: true
}
var atlasMode = false;
function playSound(id, scope) {
	if (gameOptions.sound) {
		scope.sound.play(id);
	}
}
function toggleSound(obj) {
	// switch_audio() replacement
	if (obj.name != 'sound') {
		alert('Error: Object is not sound button');
	}
	let keyName;
	if (atlasMode) {
		keyName = obj.frame.name.replace('.png', '');
	} else {
		keyName = obj.texture.key;
	}
	let btnKey = keyName.replace("btn_", "").replace("_on", "").replace("_off", "");
	if (gameOptions.sound) {
		gameOptions.sound = false;
		if (atlasMode) {
			obj.setTexture('sprite_atlas', 'btn_' + btnKey + '_off.png');
		} else {
			obj.setTexture('btn_' + btnKey + '_off');
		}
	} else {
		gameOptions.sound = true;
		if (atlasMode) {
			obj.setTexture('sprite_atlas', 'btn_' + btnKey + '_on.png');
		} else {
			obj.setTexture('btn_' + btnKey + '_on');
		}
	}
}
function setSoundButton(obj) {
	// check_audio() replacement
	if (obj.name != 'sound') {
		alert('Error: Object is not sound button');
	}
	let keyName;
	if (atlasMode) {
		keyName = obj.frame.name.replace('.png', '');
	} else {
		keyName = obj.texture.key;
	}
	let btnKey = keyName.replace("btn_", "").replace("_on", "").replace("_off", "");
	if (gameOptions.sound) {
		if (atlasMode) {
			obj.setTexture('sprite_atlas', 'btn_' + btnKey + '_on.png');
		} else {
			obj.setTexture('btn_' + btnKey + '_on');
		}
	} else {
		if (atlasMode) {
			obj.setTexture('sprite_atlas', 'btn_' + btnKey + '_off.png');
		} else {
			obj.setTexture('btn_' + btnKey + '_off');
		}
	}
}
function toggleMusic(obj) {
	if (obj.name != 'music') {
		alert('Error: Object is not music button');
	}
	let keyName;
	if (atlasMode) {
		keyName = obj.frame.name.replace('.png', '');
	} else {
		keyName = obj.texture.key;
	}
	let btnKey = keyName.replace("btn_", "").replace("_on", "").replace("_off", "");
	if (gameOptions.music) {
		gameOptions.music = false;
		if (atlasMode) {
			obj.setTexture('sprite_atlas', 'btn_' + btnKey + '_off.png');
		} else {
			obj.setTexture('btn_' + btnKey + '_off');
		}
	} else {
		gameOptions.music = true;
		if (atlasMode) {
			obj.setTexture('sprite_atlas', 'btn_' + btnKey + '_on.png');
		} else {
			obj.setTexture('btn_' + btnKey + '_on');
		}
	}
}
function setMusicButton(obj) {
	if (obj.name != 'music') {
		alert('Error: Object is not music button');
	}
	let keyName;
	if (atlasMode) {
		keyName = obj.frame.name.replace('.png', '');
	} else {
		keyName = obj.texture.key;
	}
	let btnKey = keyName.replace("btn_", "").replace("_on", "").replace("_off", "");
	if (gameOptions.music) {
		if (atlasMode) {
			obj.setTexture('sprite_atlas', 'btn_' + btnKey + '_on.png');
		} else {
			obj.setTexture('btn_' + btnKey + '_on');
		}
	} else {
		if (atlasMode) {
			obj.setTexture('sprite_atlas', 'btn_' + btnKey + '_off.png');
		} else {
			obj.setTexture('btn_' + btnKey + '_off');
		}
	}
}
function createButton(x, y, buttonType, scope) {
	var o = scope.add.sprite(x, y, 'btn_' + buttonType).setInteractive();
	o.isButton = true;
	if (buttonType.startsWith('sound')) {
		buttonType = 'sound';
	} else if (buttonType.startsWith('music')) {
		buttonType = 'music';
	}
	o.name = buttonType;
	return o;
}
function getData(key) {
	let local_data = localStorage.getItem(key);
	if(local_data){ // Data is exist
		return local_data;
	} else {
		return null; //Not exist
	}
}
function saveData(key, value) {
	localStorage.setItem(key, value);
}
function removeData(key) {
	localStorage.removeItem(key);
}
function spriteKey(key) {
	if (atlasMode) {
		return ['sprite_atlas', key + '.png'];
	} else {
		return key;
	}
}
function rawKey(key) {
	// Prevent checking by TP
	// Use original sprite key
	return key;
}