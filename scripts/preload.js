var dev_str = 'D\eve\lop\ed b\y G\imCr\aft\.co\m';
class Load extends Phaser.Scene {
	constructor(){
		super('load');
	}
	preload(){
		this.add.sprite(config.width / 2, config.height / 2, 'bg_menu');
		this.add.sprite(360, 250, 'game_title');
		let bar = this.add.rectangle(config.width/2, 900, 600, 20);
		bar.setStrokeStyle(4, 0xffffff);
		bar.alpha = 0.7;
		let progress = this.add.rectangle(config.width/2, 900, 590, 10, 0xffffff);
		progress.alpha = 0.8;
		this.load.on('progress', (value)=>{
			progress.width = 590*value;
		});
		this.load.on('complete', ()=>{
			bar.destroy();
			progress.destroy();
			this.scene.start('menu');
		}, this);
		//load all game assets
		this.load.image('a_knife', 'img/a_knife.png');
		this.load.image('b_knife', 'img/b_knife.png');
		this.load.image('c_knife', 'img/c_knife.png');
		this.load.image('bar_best', 'img/bar_best.png');
		this.load.image('bar_score', 'img/bar_score.png');
		this.load.image('btn_restart', 'img/btn_restart.png');
		this.load.image('btn_menu', 'img/btn_menu.png');
		this.load.image('popup', 'img/popup.png');
		this.load.image('txt_gameover', 'img/txt_gameover.png');
		this.load.image('txt_boss', 'img/txt_boss.png');
		this.load.image('bg_sky', 'img/bg_sky.png');
		this.load.image('bg_cloud', 'img/bg_cloud.png');
		this.load.image('bg_rock', 'img/bg_rock.png');
		this.load.image('bg_wood', 'img/bg_wood.png');
		this.load.image('btn_play', 'img/btn_play.png');
		this.load.image('btn_sound_off', 'img/btn_sound_off.png');
		this.load.image('btn_sound_on', 'img/btn_sound_on.png');
		this.load.image('half_circle', 'img/half_circle.png');
		this.load.image('quarter_circle', 'img/quarter_circle.png');
		this.load.image('icon_highscore', 'img/icon_highscore.png');
		this.load.image('icon_score', 'img/icon_score.png');
		this.load.image('target_1', 'img/target_1.png');
		this.load.image('target_2', 'img/target_2.png');
		this.load.image('target_3', 'img/target_3.png');
		this.load.image('target_4', 'img/target_4.png');
		this.load.image('target_5', 'img/target_5.png');
		this.load.image('target_6', 'img/target_6.png');
		this.load.image('knife_1', 'img/knife_1.png');
		this.load.image('knife_2', 'img/knife_2.png');
		this.load.image('knife_3', 'img/knife_3.png');
		this.load.image('knife_4', 'img/knife_4.png');
		this.load.image('knife_5', 'img/knife_5.png');
		this.load.image('knife_6', 'img/knife_6.png');
		this.load.image('knife_7', 'img/knife_7.png');
		this.load.image('knife_8', 'img/knife_8.png');
		this.load.image('knife_9', 'img/knife_9.png');
		this.load.image('knife_10', 'img/knife_10.png');
		this.load.image('knife_11', 'img/knife_11.png');
		this.load.image('watermelon', 'img/watermelon.png');

		//Load all audio
		this.load.audio('hit_fruit', 'audio/hit_fruit.mp3');
		this.load.audio('hit_knife', 'audio/hit_knife.mp3');
		this.load.audio('hit_last', 'audio/hit_last.mp3');
		this.load.audio('hit_target', 'audio/hit_target.mp3');
		this.load.audio('level_fail', 'audio/level_fail.mp3');
		this.load.audio('restart', 'audio/restart.mp3');
		this.load.audio('start', 'audio/start.mp3');
		this.load.audio('target_shown', 'audio/target_shown.mp3');
		this.load.audio('whoose', 'audio/whoose.mp3');
		
	}
}
