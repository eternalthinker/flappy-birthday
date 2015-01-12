/*
 * Birthday themed Flappy Bird clone in Phaser.js
 *
 * Author: Rahul Anand [ eternalthinker.co ], Jan 2015
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
*/

$(document).ready(function() {

var GAP = 0;
var SPEED = 200;
var game = new Phaser.Game(400, 600, Phaser.AUTO, 'game');

var mainState = {
    preload: function() { 
        game.stage.backgroundColor = '#71c5cf';
        game.load.image('bird', 'assets/bird.png'); 
        game.load.image('bottom_pipe', 'assets/bottom_pipe.png');  
        game.load.image('ground', 'assets/ground.png');  

        game.load.audio('jump', 'assets/jump.wav'); 
    },

    create: function() { 
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Pipes
        this.pipes = game.add.group(); 
        this.pipes.enableBody = true;  
        this.pipes.createMultiple(10, 'bottom_pipe'); 

        this.invisibles = game.add.group();
        this.invisibles.enableBody = true;
        this.invisibles.createMultiple(5);

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this); 

        // Bird
        this.bird = game.add.sprite(100, 245, 'bird');
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;  
        this.bird.anchor.setTo(-0.2, 0.5); 
        this.bird.onGround = false;
        this.bird.body.allowRotation = true;

        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
        this.jumpSound = game.add.audio('jump');  

        // Ground
        this.groundH = game.cache.getImage('ground').height;
        this.skyH = game.world.height - this.groundH;
        this.ground = game.add.tileSprite(0, this.skyH, game.world.width, this.groundH, 'ground');
        game.physics.arcade.enable(this.ground);
        this.ground.body.immovable = true;
        this.ground.autoScroll(-SPEED, 0);

        // Score
        this.score = 0;  
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" }); 

        GAP = Math.floor(this.bird.height * 2.5);
    },

    update: function() {
        game.debug.body(this.bird);

        if (this.bird.inWorld == false) {
            this.restartGame();
        }

        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this); 
        game.physics.arcade.overlap(this.bird, this.invisibles, this.incrementScore, null, this); 
        game.physics.arcade.collide(this.bird, this.ground, function () { this.bird.onGround = true; }, null, this);

        if (this.bird.alive && this.bird.angle > -90) {
            this.bird.angle -= 1;
        } 
        else if (!this.bird.alive && !this.bird.onGround && this.bird.angle > -90) {
            this.bird.angle -= 3;
        }
        this.bird.body.polygon.rotate(this.bird.rotation);
    },

    jump: function() {  
        if (this.bird.alive == false)  {
            return;
        }
        
        this.jumpSound.play();
        this.bird.body.velocity.y = -350;

        var animation = game.add.tween(this.bird);
        animation.to({angle: 20}, 100);
        animation.start();
    },

    hitPipe: function() {  
        if (! this.bird.alive) {
            return;
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
    },

    restartGame: function() {  
        game.state.start('main');
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
        invisible.kill();
        this.score += 1;  
        this.labelScore.text = this.score; 
    },
};

game.state.add('main', mainState);  
game.state.start('main'); 

});