/*
 * Birthday themed Flappy Bird clone in Phaser.js
 *
 * Author: Rahul Anand [ eternalthinker.co ], Jan 2015
 *
 * Thanks to following tutorials/code:
 *   
 *   https://github.com/marksteve/dtmb
 *   http://www.codevinsky.com/phaser-2-0-tutorial-flappy-bird-part-5/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
*/

$(document).ready(function() {

    var Scoreboard = function(game) { 
      var gameover;

      Phaser.Group.call(this, game);
  //gameover = this.create(this.game.width / 2, 100, 'gameover');
  //gameover.anchor.setTo(0.5, 0.5);

  this.scoreboard = this.create(this.game.width/2, 200, 'scoreboard');
  this.scoreboard.anchor.setTo(0.5, 0.5);

  this.scoreText = this.game.add.bitmapText(this.scoreboard.width + 20, 180, 'flappyfont', '', 18);
  this.add(this.scoreText);

  this.bestScoreText = this.game.add.bitmapText(this.scoreboard.width + 20, 230, 'flappyfont', '', 18);
  this.add(this.bestScoreText);

  this.medalText = this.game.add.bitmapText(this.scoreboard.x - this.scoreboard.width/2, 110, 'flappyfont', '', 18);
  this.add(this.medalText);

  // add our start button with a callback
  this.startButton = this.game.add.button(this.game.width/2, 300, 'start_button', this.startClick, this);
  this.startButton.anchor.setTo(0.5,0.5);
  // May cause the game to restart without even showing the scoreboard (continuous pressing)
  //this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR); 
  //this.spaceKey.onDown.add(this.startClick, this);

  this.add(this.startButton);

  this.y = this.game.height;
  this.x = 0;

};
Scoreboard.prototype = Object.create(Phaser.Group.prototype);  
Scoreboard.prototype.constructor = Scoreboard; 

Scoreboard.prototype.show = function(score) {  
  var medal, bestScore;

  this.scoreText.setText(score.toString());

  if(!!localStorage) {
    bestScore = localStorage.getItem('bestScore');

    if(!bestScore || bestScore < score) {
      bestScore = score;
      localStorage.setItem('bestScore', bestScore);
  }
} else {
    bestScore = 'N/A';
}

this.bestScoreText.setText(bestScore.toString());

if (score >= 30)
{
    medal = this.game.add.sprite(-65 , 7, 'medals', 0);
    this.medalText.setText("birthday gift");
} else if(score >= 23) {
    medal = this.game.add.sprite(-65 , 7, 'medals', 1);
    this.medalText.setText("birthday cake");
} else if(score >= 10) {
    medal = this.game.add.sprite(-65 , 7, 'medals', 2);
    this.medalText.setText("birthday hat");
}

if (medal) {    
    medal.anchor.setTo(0.5, 0.5);
    this.scoreboard.addChild(medal);
} else { 
    this.medalText.setText("no gifts");
}

this.game.add.tween(this).to({y: 0}, 1000, Phaser.Easing.Bounce.Out, true);
};

Scoreboard.prototype.startClick = function() {  
  this.game.state.start('play');
};

var GAP = 0;
var SPEED = 200;
var game = new Phaser.Game(400, 600, Phaser.AUTO, 'game');

var bootState = {
    preload: function () {
        game.load.image('preloader', 'assets/preloader.gif');
    },

    create: function () {
        game.input.maxPointers = 1; // No multi touch
        game.stage.backgroundColor = '7bd0e5';
        game.state.start('load');
    },
}

var loadState = {
    preload: function () {
        game.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.asset = game.add.sprite(game.width/2, game.height/2, 'preloader');
        this.asset.anchor.setTo(0.5, 0.5);
        game.load.setPreloadSprite(this.asset);

        // Load assets here
        //game.load.image('bird', 'assets/bird.png'); 
        game.load.image('bottom_pipe', 'assets/bottom_pipe.png');  
        game.load.image('ground', 'assets/ground.png');  
        game.load.image('start_button', 'assets/start-button.png');
        game.load.image('scoreboard', 'assets/scoreboard.png');
        game.load.image('background', 'assets/background.png');
        game.load.image('title', 'assets/title.png');
        game.load.image('get_ready', 'assets/get-ready.png');
        game.load.image('rocket_fire_particle', 'assets/rocket_fire_particle.png');
        game.load.image('cloud', 'assets/cloud.png');

        game.load.spritesheet('medals', 'assets/medals.png', 44, 46, 3);
        game.load.spritesheet('bird', 'assets/bird_sheet.png', 28, 52, 4, 0, 2); 

        game.load.audio('jump', 'assets/jump.wav'); 
        game.load.audio('pipe_hit', 'assets/pipe-hit.wav'); 
        game.load.audio('ground_hit', 'assets/ground-hit.wav'); 
        game.load.audio('score', 'assets/score.wav'); 

        this.load.bitmapFont('flappyfont', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');
    },

    create: function () {
        this.asset.cropEnabled = false;
    },

    update: function () {
        if(!!this.ready) {
            game.state.start('menu');
        }
    },

    onLoadComplete: function () {
        this.ready = true;
    }
}

var menuState = {
    preload: function () {

    },

    create: function () {
        //this.background = this.game.add.tileSprite(0, 0, game.world.width, game.world.height, 'background');

        this.groundH = game.cache.getImage('ground').height;
        this.skyH = game.world.height - this.groundH;
        this.ground = game.add.tileSprite(0, this.skyH, game.world.width, this.groundH, 'ground');
        this.ground.autoScroll(-SPEED, 0);

        this.titleGroup = this.game.add.group();
        this.title = this.game.add.sprite(0,0,'title');
        this.titleGroup.add(this.title);
        this.bird = this.game.add.sprite(120, 50, 'bird');
        this.bird.animations.add('dummy_fly', [1,2,3], 10, true);
        this.bird.animations.play('dummy_fly');
        this.titleGroup.add(this.bird);
        this.titleGroup.x = game.width/2 - this.titleGroup.width/2;
        this.titleGroup.y = 100;
        this.game.add.tween(this.titleGroup).to({y:115}, 350, Phaser.Easing.Linear.NONE, true, 0, 1000, true);

        this.startButton = this.game.add.button(this.game.width/2, 300, 'start_button', this.startClick, this);
        this.startButton.anchor.setTo(0.5,0.5);
        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.spaceKey.onDown.add(this.startClick, this);
    },

    update: function () {

    },

    shutdown: function() {  
        this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
    },

    startClick: function () {  
        this.game.state.start('play');
    }
}

var playState = {
    preload: function() { 
        
    },

    create: function() { 
        //this.background = this.game.add.tileSprite(0, 0, game.world.width, game.world.height, 'background');

        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.started = false;

        // Clouds
        this.clouds = game.add.group();
        for(var i=0; i<3; i++){
            var cloud = game.add.sprite(game.rnd.integerInRange(0, game.width), game.rnd.integerInRange(0, 50), 'cloud');
            cloud.anchor.setTo(0.5, 0);
            this.clouds.add(cloud);
            cloud.checkWorldBounds = true;
            cloud.outOfBoundsKill = true;
            // Move clouds
            game.physics.arcade.enableBody(cloud);
            cloud.body.velocity.x = -this.game.rnd.integerInRange(15, 30);
        }

        // Initial instructions
        this.instructionGroup = game.add.group();
        this.instructionGroup.add(game.add.sprite(this.game.width/2, 100,'get_ready'));
        var instructionText = game.add.bitmapText(0, 325, 'flappyfont', "Click or Tap SPACE to fly", 20);
        instructionText.x = game.width/2 - instructionText.width/2;
        this.instructionGroup.add(instructionText);
        this.instructionGroup.setAll('anchor.x', 0.5);
        this.instructionGroup.setAll('anchor.y', 0.5);

        // Pipes
        this.pipes = game.add.group(); 
        this.pipes.enableBody = true;  
        this.pipes.createMultiple(10, 'bottom_pipe'); 

        this.invisibles = game.add.group();
        this.invisibles.enableBody = true;
        this.invisibles.createMultiple(5);

        // Bird
        this.bird = game.add.sprite(100, 245, 'bird', 0);
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;  
        this.bird.anchor.setTo(-0.2, 0.5); 
        this.bird.onGround = false;
        this.bird.flying = false; // State before the first tap
        this.bird.body.allowGravity = false;
        this.bird.animations.add('dummy_fly', [1,2,3], 10, true);
        this.bird.animations.add('fly', [1,2,3], 10, false);
        this.bird.events.onAnimationComplete.add(function () {
            this.bird.frame = 0;
        }, this);
        this.bird.animations.play('dummy_fly');

        this.rocket_emitter = game.add.emitter(0, 0, 100);
        this.rocket_emitter.makeParticles('rocket_fire_particle');
        this.rocket_emitter.gravity = 200;
        this.rocket_emitter.setXSpeed(-20, -50);
        this.rocket_emitter.setRotation(0, -90);


        this.flapKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.flapKey.onDown.addOnce(this.startGame, this);
        this.flapKey.onDown.add(this.jump, this);
        // Add mouse/touch controls
        game.input.onDown.addOnce(this.startGame, this);
        game.input.onDown.add(this.jump, this);
        // Keep the spacebar from propogating up to the browser
        game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

        this.jumpSound = game.add.audio('jump');  
        this.pipeHitSound = game.add.audio('pipe_hit');
        this.groundHitSound = game.add.audio('ground_hit');
        this.scoreSound = game.add.audio('score');

        // Ground
        this.groundH = game.cache.getImage('ground').height;
        this.skyH = game.world.height - this.groundH;
        this.ground = game.add.tileSprite(0, this.skyH, game.world.width, this.groundH, 'ground');
        game.physics.arcade.enable(this.ground);
        this.ground.body.immovable = true;
        this.ground.autoScroll(-SPEED, 0);

        // Score
        this.score = 0;  
        //this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" }); 
        this.scoreText = this.game.add.bitmapText(this.game.width/2, 10, 'flappyfont', this.score.toString(), 24);

        GAP = Math.floor(this.bird.height * 2.5);
    },

    update: function() {
        //game.debug.body(this.bird);

        if (! this.bird.flying) {
            return;
        }

        if (this.bird.inWorld == false) {
            this.die();
        }

        //this.rocket_emitter.x = this.bird.x;
        //this.rocket_emitter.y = this.bird.y;

        game.physics.arcade.overlap(this.bird, this.pipes, this.die, null, this); 
        game.physics.arcade.overlap(this.bird, this.invisibles, this.incrementScore, null, this); 
        game.physics.arcade.collide(this.bird, this.ground, this.hitGround, null, this);

        if (this.bird.alive && this.bird.angle > -90) {
            this.bird.angle -= 1;
        } 
        else if (!this.bird.alive  && this.bird.angle > -180) {
            this.bird.angle -= 10;
            if (this.bird.angle > 0 && this.bird.angle > 160) {
                this.bird.angle = -180;
            }
        }
    },

    shutdown: function() {  
        this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
        this.bird.destroy();
        this.pipes.destroy();
        this.invisibles.destroy();
    },

    startGame: function() {
        if (!! this.started) {
            return;
        }
        this.started = true;
        this.bird.body.allowGravity = true;
        this.bird.flying = true;
        this.bird.animations.stop('dummy_fly');

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this); // Pipe generate timer
        this.instructionGroup.destroy();
    },

    jump: function() {  
        if (this.bird.alive == false)  {
            return;
        }
        
        this.jumpSound.play();
        this.bird.body.velocity.y = -350;

        var animation = game.add.tween(this.bird).to({angle: 20}, 100).start();
        this.bird.animations.play('fly');

        this.rocket_emitter.x = this.bird.x;
        this.rocket_emitter.y = this.bird.y;
        this.rocket_emitter.start(true, 2000, null, 10);
    },

    die: function() {  
        if (! this.bird.alive) {
            return;
        }

        if (! this.bird.onGround) {
            this.pipeHitSound.play();
        }
        this.bird.alive = false;
        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);
        // Go through all the pipes, and stop their movement
        this.pipes.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, this);
        this.invisibles.forEachAlive(function(inv){
            inv.body.velocity.x = 0;
        }, this);
        this.ground.autoScroll(0, 0);

        // Score screen
        this.scoreboard = new Scoreboard(game);
        this.game.add.existing(this.scoreboard);
        this.scoreboard.show(this.score);
    },

    hitGround: function () {
        if (this.bird.onGround) {
            return;
        }

        this.groundHitSound.play();
        this.bird.onGround = true;
        this.bird.animations.play('dummy_fly');
        $.proxy(this.die, this)();
    },

    addOnePipe: function (yMidGap, flip) {  
        var pipe = this.pipes.getFirstDead();
        pipe.reset(game.width, yMidGap + (flip? -GAP: GAP)/2 );
        // Flip physically - do this only AFTER setting y_pos
        if (flip) { 
            pipe.scale.y = -1;
            pipe.body.offset.y = -pipe.body.height;
        }
        pipe.body.velocity.x = -SPEED; 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;

        return pipe;
    },

    addRowOfPipes: function () {  
        // Pick the middle y_pos of the gap
        var yMidGap = Math.floor( this.skyH/2 + (Math.random() > 0.5 ? 1 : -1) * Math.random() * this.skyH/4 );
        //var yMidGap = Math.floor( game.world.height/2 + (Math.random() > 0.5 ? 1 : 0) * game.world.height/4 );

        //( (game.height - 16 - o() / 2) / 2 ) + (Math.random() > 0.5 ? -1 : 1) * Math.random() * game.height / 6;

        // Add pipes
        var bottomPipe = this.addOnePipe(yMidGap, false);
        this.addOnePipe(yMidGap, true);

        // Add invisible score tester
        var invisible = this.invisibles.getFirstDead();
        invisible.reset(bottomPipe.x + bottomPipe.width, 0)
        invisible.width = 2;
        invisible.height = game.world.height;
        invisible.body.velocity.x = -SPEED;
    },

    incrementScore: function (_, invisible) {
        this.scoreSound.play();
        invisible.kill();
        this.score += 1;  
        // this.labelScore.text = this.score; 
        this.scoreText.destroy();
        this.scoreText = this.game.add.bitmapText(this.game.width/2, 10, 'flappyfont', this.score.toString(), 24);
    },
};

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);  
game.state.start('boot'); 

});