class Boot extends Phaser.Scene {
	constructor(){
		super('boot');
	}
	preload(){
		//load some initial sprites
		this.load.image('bg_menu', 'img/bg_menu.png');
		this.load.image('game_title', 'img/game_title.png');
		this.load.spritesheet('particle', 'img/particle.png', { frameWidth: 32, frameHeight: 32 });
		this.load.image('particle_grey', 'img/particle_grey.png');
	}
	create(){
		this.scale.stopListeners();
		this.scene.start('load');
	}
}