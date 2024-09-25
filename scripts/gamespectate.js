class Game extends Phaser.Scene {
	constructor() {
		super('game');
		this.target = null;
		this.knife = null;
		this.isKnifeFlying = false;
		this.stuckKnives = null;
		this.targetDiameter = 436;
		this.isGameover = false;
		this.targetBreak = false;
		this.rotBefore = 0;
		this.first = true
		this.initSocketListeners();
		this.scoreText = null;
		this.firstStringKnife = null;
		this.firstPickTarget = null;
		this.OpponentScoreText = null
		this.timerValue = 0;
		this.currentLevel = 0

	}

	initSocketListeners() {

		window.socket.on('syncState', (state) => {
			if (SHOW_GAMEPLAY && state.otherPlayer === PLAYER_ID) {
				this.syncGameState(state);
			}

		});
	}

	update() {

		if (this.isGameover || this.targetBreak) return;
		let rot = this.target.rotation - this.rotBefore;
		this.rotBefore = this.target.rotation;
		if (this.stuckKnives != null) {
			Phaser.Actions.RotateAroundDistance(this.stuckKnives.getChildren(), { x: config.width / 2, y: 300 }, rot, this.targetDiameter / 2);
			let children = this.stuckKnives.getChildren();
			for (let knife of children) {
				let rotation = Phaser.Math.Angle.Between(knife.x, knife.y, this.target.x, this.target.y) + (Math.PI * 0.5);
				knife.rotation = rotation;
			}
		}

		if (this.bonusInGame.getLength() > 0) {
			Phaser.Actions.RotateAroundDistance(this.bonusInGame.getChildren(), { x: config.width / 2, y: 300 }, rot, this.targetDiameter * 0.55);
			let children = this.bonusInGame.getChildren();
			for (let bonus of children) {
				let rotation = Phaser.Math.Angle.Between(bonus.x, bonus.y, this.target.x, this.target.y) + (Math.PI * 1.75);
				bonus.rotation = rotation;
			}
		}
	

	}

	create() {

		window.socket.on("emitTime", (data) => {
			if (SHOW_GAMEPLAY && data.otherPlayer === PLAYER_ID) {
				this.timerValue = data.playerTime
				this.timerText.setText(`Time: ${this.timerValue}`);
			}

		})

		window.socket.on('emitGameEnd', (data) => {
			if (SHOW_GAMEPLAY && data.otherPlayer === PLAYER_ID) {
				self.isGameover = true;
				knife.setVisible(false);
				self.time.delayedCall(500, gameOver);
			}


		});

		window.socket.on('knifeCollision', (data) => {
			if (SHOW_GAMEPLAY) {
				stuckKnifeCollision()
			}

		});

		window.socket.on('throw', (data) => {
			// isKnifeFlying = true;
			if (SHOW_GAMEPLAY && data.otherPlayer === PLAYER_ID) {
				knife.setVelocityY(-2200);
			}


		});


		window.socket.on("scoreUpdate", (data) => {
			
			if (SHOW_GAMEPLAY && data.otherPlayer == PLAYER_ID) {
				this.scoreText.text = data.score
				targetKnives = data.targetKnives
				if (data.targetKnives <= 0) {
					targetTween.stop();
					self.targetBreak = true;
					self.target.setScale(0);
					breakTarget(data.target, 720, 600, 0);
					breakTarget(data.target, 0, 600, 90);
					breakTarget(data.target, 0, 20, 180);
					breakTarget(data.target, 720, 20, 270);
					self.physics.world.gravity = { x: 0, y: 300 };
					for (let sKnife of self.stuckKnives.getChildren()) {
						sKnife.body.velocity.y = 100 + Math.random() * 300;
						self.tweens.add({
							targets: sKnife,
							angle: (Math.random() >= 0.5) ? 360 : -360,
							duration: Phaser.Math.Between(2000, 4000),
							repeat: -1,
							ease: 'Sine.easeIn'
						})
					}
					knife.y = -1000;

					self.time.addEvent({
						delay: 1500,
						callback: () => {
							if (data.level % 2 == 0 && data.level > 0) {
								showBossMode();
							}
							else {
								// recreateLevel();
								isBoss = false;
								//bossMode()
							}
						}
					})

				}
			}

		})

		window.socket.on("runningUpdate", (data) => {
			if (SHOW_GAMEPLAY && data.otherPlayer === PLAYER_ID) {
				if (self.firstPickTarget != data.pickTarget) {
					self.firstPickTarget = data.pickTarget
					self.target.setTexture(spriteKey(data.pickTarget));
				}
				if (self.firstStringKnife != data.stringKnife) {
					self.firstStringKnife = data.stringKnife
					knife.setTexture(spriteKey(data.stringKnife));
				}

			}

		})

		window.socket.on("newLevel", (data) => {

			if (SHOW_GAMEPLAY && data.otherPlayer == PLAYER_ID) {
				self.tweens.killAll();
				// isKnifeFlying = true;
				// knife.setVelocityY(-2200);
				self.target.setTexture(spriteKey(data.pickTarget));
				self.target.setScale(1);
				knife.y = 940;
				knife.setTexture(spriteKey(data.stringKnife));
				let defaultTimeDuration = 2000; //1800 //1300
				let rotationDuration = 0;
				if (data.pickTween == 'Sine') {
					rotationDuration = defaultTimeDuration;
					targetRotation.push(Math.PI * 2.25);
					targetRotation.push(-Math.PI * 2.5);
				} else {
					rotationDuration = data.rotationDuration;
					targetRotation.push(Math.PI * 2);
				}
				targetTween = self.tweens.add({
					targets: self.target,
					rotation: targetRotation[0],
					duration: rotationDuration,
					//yoyo: true,
					//repeat: -1,
					onComplete: () => {
						retweenTarget(data.pickTween, rotationDuration, targetRotation[0], targetRotation);
					},
					ease: data.pickTween//random
				});


				self.stuckKnives.clear(true, true);
				self.bonusInGame.clear(true, true);
				self.physics.world.gravity = { x: 0, y: 0 };
			}

		})




		playSound('target_shown', this);
		const self = this;
		let isKnifeFlying = false;
		const minSpeed = 0.007;
		const maxSpeed = 0.01;
		if (window.innerWidth > 768) {
			this.add.sprite(0, 0, spriteKey(bgTexture)).setOrigin(0);
		}

		if (firstLoad) firstLoad = false;

		let defaultTargetKnives = 5;
		let targetKnives = defaultTargetKnives;
		let score = 0;
		let opponentScore = 0;

		this.isGameover = false;
		this.state = 'wait';
		let isBoss = false;

		let bgKnives = this.add.group();
		let knives = this.add.group();
		this.stuckKnives = this.physics.add.group();
		this.bonusInGame = this.physics.add.group();
		let randompickTarget = Phaser.Math.RND.pick(['target_1', 'target_2', 'target_3', 'target_5', 'target_6']);//remove target_4, for make as boss
		self.firstPickTarget = randompickTarget
		let stringKnifeTexture = Phaser.Math.RND.pick(['knife_11']);
		self.firstStringKnife = stringKnifeTexture
		this.target = this.physics.add.sprite(config.width / 2, 300, spriteKey(randompickTarget));
		this.target.setDepth(1);
		this.target.setScale(0);
		this.target.setCircle(this.targetDiameter / 2);
		this.target.body.allowGravity = false;

		let targetTween = null;
		let targetRotation = [];

		let emitter = self.add.particles('particle_grey', {
			lifespan: 800,
			speed: { min: 100, max: 220 },
			scale: { start: 0.4, end: 0 },
			gravityY: 600,
			emitting: false,
			frequency: -1,
		});

		//first spawn
		this.tweens.add({
			targets: this.target,
			scale: 1,
			duration: 300,
			ease: 'Sine.easeOut',
			onComplete: () => {
				//tween random
				targetTween = self.tweens.add({
					targets: self.target,
					rotation: Math.PI * 2,
					duration: 2000,
					//yoyo: true,
					repeat: -1,
					ease: 'Linear'//random
				});
				self.state = 'play';
			}
		});

		//ui score
		// this.add.sprite(50, 50, 'icon_score');

		if (SHOW_GAMEPLAY) {
			this.timerText = this.add.text(500, 950, `Timer: ${this.timerValue}`, {
				fontSize: '32px',
				fill: '#ffffff'
			});
		}

		


		this.add.text(40, 20, "Game Score", { fontSize: 24, align: 'left', fontFamily: 'vanilla' });

		if (this.scoreText == null) {
			this.scoreText = this.add.text(100, 50, score, { fontSize: 40, align: 'left', fontFamily: 'vanilla' });
		} else {
			this.scoreText = this.add.text(100, 50, this.scoreText.text, { fontSize: 40, align: 'left', fontFamily: 'vanilla' });
		}
		

		let knife = self.physics.add.sprite(config.width / 2, 940, spriteKey(stringKnifeTexture));

		knife.body.setSize(30, 30);
		knife.body.allowGravity = false;

		this.physics.add.overlap(knife, this.target, knifeCollision, null, this);

		
		this.physics.add.overlap(knife, this.bonusInGame, bonusCollision, null, this);
		


		this.input.on('gameobjectdown', (pointer, obj) => {

			if (obj.isButton && CAN_PLAY) {
				this.tweens.add({
					targets: obj,
					scaleX: 0.9,
					scaleY: 0.9,
					yoyo: true,
					ease: 'Linear',
					duration: 100,
					onComplete: function () {
						if (obj.name === 'restart') {
							window.open(`${LINK}/?matchId=${ROOM_ID}&emit=true&player1Id=${PLAYER_ID}temp`, "_blank")
						}
					}
				})
			}
		});

		//changeRotationSpeed();
		

		function spawnKnifeTargets() {
			let children = knives.getChildren();
			let childrenBG = bgKnives.getChildren();
			for (let i = 0; i < targetKnives; i++) {
				if (children.length > i) {
					children[i].setPosition(50, 960 - i * 50);
					children[i].setTexture('a_knife');
					children[i].angle = 0;
					childrenBG[i].angle = 0;
				}
				else {
					bgKnives.get(50, 960 - i * 50, spriteKey('c_knife'));
					knives.get(50, 960 - i * 50, spriteKey('a_knife'));
				}
			}
		}
		//after level 1
		function recreateLevel() {

			resetKnife();
			self.tweens.killAll();
			let _randompickTarget = Phaser.Math.RND.pick(['target_1', 'target_2', 'target_3', 'target_5', 'target_6']);
			stringKnifeTexture = Phaser.Math.RND.pick(['knife_11']);




			if (isBoss) _randompickTarget = 'target_4';
		

			randompickTarget = _randompickTarget;
			self.target.setScale(1);
			//knife.setVisible(true);
			knife.y = 940;
			

			self.firstPickTarget = _randompickTarget
			self.firstStringKnife = stringKnifeTexture
			self.currentLevel += 1;
			targetKnives = defaultTargetKnives + self.currentLevel;
			if (targetKnives > 9) targetKnives = 9;
			//targetKnifes = 6;
			self.targetBreak = false;

		


			let pickTween = Phaser.Math.RND.pick(['Sine', 'Linear']);
			let defaultTimeDuration = 2000; //1800 //1300
			let rotationDuration = 0;
			rotationDuration = Phaser.Math.RND.between(15, 20) * 100;
			


			if (pickTween == 'Sine') {
				rotationDuration = defaultTimeDuration;
				targetRotation.push(Math.PI * 2.25);
				targetRotation.push(-Math.PI * 2.5);
			}
			else { //Linear

				targetRotation.push(Math.PI * 2);
			}


			targetTween = self.tweens.add({
				targets: self.target,
				rotation: targetRotation[0],
				duration: rotationDuration,
				//yoyo: true,
				//repeat: -1,
				onComplete: () => {
					retweenTarget(pickTween, rotationDuration, targetRotation[0], targetRotation);
				},
				ease: pickTween//random
			});


			self.stuckKnives.clear(true, true);
			self.bonusInGame.clear(true, true);
			self.physics.world.gravity = { x: 0, y: 0 };

			//random obstacle
			let min = self.currentLevel - 1 < 0 ? 0 : self.currentLevel - 1;
			let obstacle = Phaser.Math.RND.between(min, self.currentLevel + 1);
			let randPick = [0, Math.PI * 0.125, Math.PI * 0.25, Math.PI, Math.PI * 0.5, Math.PI * 0.75, Math.PI * 0.625, Math.PI * 0.875, Math.PI * 1.125, Math.PI * 1.25, Math.PI * 1.5, Math.PI * 1.625, Math.PI * 1.75, Math.PI * 1.875, Math.PI * 2];
			for (let i = 0; i < obstacle; i++) {
				//let radianOnTarget = Phaser.Math.FloatBetween(0, Math.PI * 2);
				let pick = Phaser.Math.RND.between(0, randPick.length - 1);
				let radianOnTarget = randPick[pick];
				randPick.splice(pick, 1);
				let _x = Math.cos(radianOnTarget) * self.targetDiameter * 0.5;
				let _y = Math.sin(radianOnTarget) * self.targetDiameter * 0.5;
				let stuckKnife = self.physics.add.sprite(self.target.x + _x, self.target.y + _y, 'knife_11');
				stuckKnife.body.setSize(30, 30);
				stuckKnife.radianOnTarget = radianOnTarget;
				//console.log(_x, _y, radianOnTarget);
				self.stuckKnives.add(stuckKnife);
			}

			//random bonus
			let possibleFruitShow = Math.random() * 100 > 75 ? true : false;
			if (possibleFruitShow) {
				let pick = Phaser.Math.RND.between(0, randPick.length - 1);
				let radianOnTarget = randPick[pick];
				randPick.splice(pick, 1);
				let _x = Math.cos(radianOnTarget) * self.targetDiameter * 0.5;
				let _y = Math.sin(radianOnTarget) * self.targetDiameter * 0.5;
				let watermelon = self.physics.add.sprite(self.target.x + _x, self.target.y + _y, 'watermelon');
				watermelon.body.setSize(48, 48);
				watermelon.radianOnTarget = radianOnTarget;
				self.bonusInGame.add(watermelon);
			}


			isBoss = false

		}
		function showBossMode() {
			isBoss = true;
			let txtBoss = self.add.sprite(config.width / 2, -180, 'txt_boss');
			self.tweens.add({
				targets: txtBoss,
				y: 220,
				duration: 400,
				onComplete: () => {
					self.tweens.add({
						targets: txtBoss,
						delay: 600,
						alpha: 0,
						onComplete: () => {
							recreateLevel();
						}
					});
				}
			});

		}

		function retweenTarget(_ease, _duration, _currentRotation, _arrayTargetRotation) {
			let tRotation = 0;
			if (_ease != 'Linear') {
				tRotation = _currentRotation == _arrayTargetRotation[0] ? _arrayTargetRotation[1] : _arrayTargetRotation[0];
			}
			else {
				tRotation = _currentRotation;
			}
			targetTween = self.tweens.add({
				targets: self.target,
				rotation: tRotation,
				duration: _duration,
				//yoyo: true,
				//repeat: -1,
				onComplete: () => {
					retweenTarget(_ease, _duration, tRotation, _arrayTargetRotation);
				},
				ease: _ease//random
			});
		}
		function resetKnife() {

			knife.setVelocityY(0);
			knife.setPosition(config.width / 2, 940);
			isKnifeFlying = false;

		}
		function spawnStuckKnife() {
			let stuckKnife = self.physics.add.sprite(self.target.x, self.target.y + self.targetDiameter / 2, spriteKey(stringKnifeTexture));
			stuckKnife.body.setSize(30, 30);
			stuckKnife.radianOnTarget = self.target.rotation;
			self.stuckKnives.add(stuckKnife);
			//self.target.rotation += 0.15;
			//emitter.particleTint = particleTint
			emitter.emitParticleAt(self.target.x, self.target.y + self.targetDiameter / 2, 8);

		}
		function knifeCollision(knife, target) {
			if (self.isGameover) return;
			playSound('hit_target', self);
			spawnStuckKnife();
			resetKnife();
			shakeCamera();
			

		}
		function stuckKnifeCollision(knife, stuckKnife) {
			// Gameover
			if (!self.isGameover) {



				playSound('hit_knife', self);
				var data = {
					roomID: ROOM_ID,
					playerID: PLAYER_ID,
				}
				

				if (SHOW_GAMEPLAY) {
					window.socket.emit("emitGameEnd", data)
				}

				self.isGameover = true;
				self.physics.world.gravity = { x: 0, y: 300 };
				for (let sKnife of self.stuckKnives.getChildren()) {
					sKnife.body.velocity.y = 100 + Math.random() * 300;
					self.tweens.add({
						targets: sKnife,
						angle: (Math.random() >= 0.5) ? 360 : -360,
						duration: Phaser.Math.Between(2000, 4000),
						repeat: -1,
						ease: 'Sine.easeIn'
					})
				}

				knife.setVisible(false);
				self.time.delayedCall(500, gameOver);
			
			}
		}
		function bonusCollision(knife, bonus) {
			bonus.destroy();
			score += 5;
			this.scoreText.text = score;
			checkSaveScore();
		}
		function throwKnife() {

			if (CAN_PLAY) {
				if (this?.state == 'wait' || this?.isGameover) return;
				if (!isKnifeFlying) {
				
					isKnifeFlying = true;
					knife.setVelocityY(-2200);
					let animsKnives = targetKnives - 1;
					if (animsKnives >= 0) {
						let childrenBG = bgKnives.getChildren();
						let childrenKnives = knives.getChildren();
						self.tweens.add({
							targets: [childrenBG[animsKnives], childrenKnives[animsKnives]],
							angle: 180,
							duration: 100,
							onComplete: function (tween, objs) {
								let obj = objs[1];
								obj.setTexture('b_knife');
							}
						})
					}
				}
			}

		}
		function shakeCamera() {
			self.cameras.main.shake(100, 0.01);
		}
		function breakTarget(currentKey, targetMoveX, targetMoveY, angle) {
			playSound('hit_last', self);
			let sprite = self.physics.add.sprite(config.width / 2, 300, spriteKey(currentKey));
			let spriteMask = self.physics.add.sprite(config.width / 2, 300, 'half_circle').setOrigin(0).setVisible(false).setAngle(angle);
			let mask = spriteMask.createBitmapMask();
			sprite.setMask(mask);
			self.tweens.add({
				targets: [sprite, spriteMask],
				//x: targetMoveX,
				//y: targetMoveY,
				angle: Math.random() > 0.5 ? 180 : -180,
				duration: 1200,
				alpha: 0,
				onComplete: function (tween, objs) {
					objs.forEach(obj => {
						obj.destroy();
					})
				}
				//repeat: -1
			});
			spriteMask.body.setEnable(true);
			sprite.body.setEnable(true);
			let velX = Phaser.Math.Between(-5, 5) * 100;
			let velY = Phaser.Math.Between(8, 20) * -10;
			spriteMask.setVelocity(velX, velY);
			sprite.setVelocity(velX, velY);
		}
		function checkSaveScore() {
			if (score > bestscore) {
				bestscore = score;
			}
			if (score >= bestscore) {
				saveData(storageKey, bestscore);
			}
		}
		function gameOver() {
			playSound('level_fail', self);
			self.target.setDepth(0);
			let dark = self.add.rectangle(0, 0, config.width, config.height, 0x000000).setOrigin(0);
			dark.setInteractive();
			dark.alpha = 0;
			self.tweens.add({
				targets: dark,
				alpha: 0.5,
				duration: 500
			});
			self.add.sprite(config.width / 2, config.height / 2, 'popup');
			self.add.sprite(config.width / 2, 390, 'txt_gameover');
			self.add.sprite(config.width / 2, 490, 'bar_score');
			self.add.text(config.width / 2 + 110, 490, self.scoreText.text, { fontFamily: 'vanilla', fontSize: 28, align: 'right', color: '#FFFFFF' }).setOrigin(1, 0.5).setDepth(1);
			createButton(config.width / 2, 670, 'restart', self)
		}

	
		self.knife = knife

	}
	emitGameState() {
		const gameState = {
			targetRotation: this.target.rotation,
			stuckKnives: this.stuckKnives.getChildren().map((knife) => ({
				x: knife.x,
				y: knife.y,
				rotation: knife.rotation,
			})),
			bonusInGame: this.bonusInGame.getChildren().map((bonus) => ({
				x: bonus.x,
				y: bonus.y,
				rotation: bonus.rotation,
			})),
			currentLevel: this.currentLevel,
			score: this.scoreText.text,
			roomID: ROOM_ID,
			playerID: PLAYER_ID,
		};
		window.socket.emit('updateState', gameState);
	}

	syncGameState(state) {
		// console.log(state)
		if (SHOW_GAMEPLAY) {
			if (this.target?.rotation) {
				this.target.rotation = state.targetRotation;
			}
			if (this.scoreText?.text) {
				this.scoreText.text = state.score;
			}
			this.currentLevel = state.currentLevel;


			// Sync stuck knives
			if (this.stuckKnives) {
				this.stuckKnives.clear(true, true);
				state.stuckKnives.forEach((knifeData) => {
					const knife = this.physics.add.sprite(
						knifeData.x,
						knifeData.y,
						'knife_11'
					);
					knife.rotation = knifeData.rotation;
					this.stuckKnives.add(knife);
				});
			}
			if (this.bonusInGame) {
				this.bonusInGame.clear(true, true);
				state.bonusInGame.forEach((bonusData) => {
					const bonus = this.physics.add.sprite(
						bonusData.x,
						bonusData.y,
						'watermelon'
					);
					bonus.rotation = bonusData.rotation;
					this.bonusInGame.add(bonus);
				});
			}

			// Sync bonus items

		}

	}

	updateTimer() {
		if (CAN_PLAY) {
			this.timerValue += 1;
			this.timerText.setText(`Time: ${this.timerValue}`);
			if (this.timerValue >= 60) {
				CAN_PLAY = false
				this.onTimerComplete();
				this.timerValue = 60;
			}
		}

	}
}
const isMobile = window.innerWidth <= 768;
var config = {
	type: Phaser.AUTO,
	width: 720,
	height: 1080,
	transparent: isMobile,
	scale: {
		mode: Phaser.Scale.FIT,
		parent: 'game_content',
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
		}
	},


	fps: {
		target: 60,
		min: 30,
		forceSetTimeOut: true,
	},
	disableVisibilityChange: true,
	scene: [Boot, Load, Menu, Game],
}
var game = new Phaser.Game(config);