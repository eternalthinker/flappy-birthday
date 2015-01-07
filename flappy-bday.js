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

var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game');

var mainState = {
    preload: function() { 
        game.stage.backgroundColor = '#71c5cf';
        game.load.image('bird', 'assets/bird.png'); 
        game.load.image('pipe', 'assets/pipe.png');  
        game.load.audio('jump', 'assets/jump.wav'); 
    },

    create: function() { 
        // Bird
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.bird = this.game.add.sprite(100, 245, 'bird');
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;  
        this.bird.anchor.setTo(-0.2, 0.5); 

        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);

        this.jumpSound = game.add.audio('jump');  

        // Pipes
        this.pipes = game.add.group(); 
        this.pipes.enableBody = true;  
        this.pipes.createMultiple(20, 'pipe'); 

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this); 

        // Score
        this.score = 0;  
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" }); 
    },

    update: function() {
        if (this.bird.inWorld == false) {
            this.restartGame();
        }

        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this); 

        if (this.bird.angle < 20) {
            this.bird.angle += 1;
        }
    },

    jump: function() {  
        if (this.bird.alive == false)  {
            return;
        }
        
        this.jumpSound.play();
        this.bird.body.velocity.y = -350;

        var animation = game.add.tween(this.bird);
        animation.to({angle: -20}, 100);
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
    },

    restartGame: function() {  
        game.state.start('main');
    },

    addOnePipe: function(x, y) {  
        var pipe = this.pipes.getFirstDead();
        pipe.reset(x, y);
        pipe.body.velocity.x = -200; 

        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {  
        // Pick where the hole will be
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 pipes 
        for (var i = 0; i < 8; i++) {
            if (i != hole && i != hole + 1) {
                this.addOnePipe(400, i * 60 + 10);   
            }
        }

        this.score += 1;  
        this.labelScore.text = this.score; 
    },
};

game.state.add('main', mainState);  
game.state.start('main'); 

});