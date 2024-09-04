class Menu extends Phaser.Scene {
	constructor() {
		super('menu');
	}
	create() {
		var self = this;
		if (firstLoad) {
			bgTexture = 'bg_sky';
		}
		else {
			bgTexture = Phaser.Math.RND.pick(['bg_cloud', 'bg_rock', 'bg_sky', 'bg_wood']);
		}
		this.add.sprite(config.width / 2, config.height / 2, spriteKey(bgTexture));
		let title = this.add.sprite(360, 260, 'game_title');
		this.tweens.add({
			targets: title,
			y: title.y + 30,
			duration: 1300,
			ease: 'Sine.easeInOut',
			yoyo: true,
			repeat: -1,
		});
		this.add.sprite(config.width * 0.4, 550, 'icon_highscore');
		this.add.text(385, 550, bestscore, { fontFamily: 'vanilla', fontSize: 40, align: 'center', color: '#ffffff' }).setOrigin(0.5, 0.5);
		let btnPlay = createButton(config.width * 0.5, 800, 'play', self);
		let btnSound = createButton(60, 60, 'sound_on', self);
		setSoundButton(btnSound);
		playSound('start', self);
		self.scene.start('game');
		this.input.on('gameobjectdown', (pointer, obj) => {
			if (obj.isButton) {
				//playSound('click', this);
				this.tweens.add({
					targets: obj,
					scaleX: 0.9,
					scaleY: 0.9,
					yoyo: true,
					ease: 'Linear',
					duration: 100,
					onComplete: function () {
						if (obj.name === 'sound') {
							toggleSound(obj);
						}
						// else if (obj.name === 'play') {
						// 	playSound('start', self);
						// 	self.scene.start('game');
						// }
					}
				}, this);
			}
		}, this);
	}
}