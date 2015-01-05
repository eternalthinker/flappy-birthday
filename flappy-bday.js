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

        $('#logout').click(function () {
            $.ajax ( {
                url: "http://localhost:8080/logout",
                cache: false,
                beforeSend: function (xhr) { xhr.setRequestHeader("Authorization", "Basic " + btoa("username:password")); }
            });
        });

});