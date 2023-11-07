function getBrightness(hex) {
    const red = parseInt(hex.slice(1, 3), 16);
    const green = parseInt(hex.slice(3, 5), 16);
    const blue = parseInt(hex.slice(5, 7), 16);
    return Math.round((red + green + blue) / 3); // Round the average to the nearest integer
}

function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToRgba(hex, alpha) {
    const red = parseInt(hex.slice(1, 3), 16);
    const green = parseInt(hex.slice(3, 5), 16);
    const blue = parseInt(hex.slice(5, 7), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function washedColor(hexcode) {
    const red = parseInt(hexcode.slice(1, 3), 16);
    const green = parseInt(hexcode.slice(3, 5), 16);
    const blue = parseInt(hexcode.slice(5, 7), 16);

    let newRed = red;
    let newGreen = green;
    let newBlue = blue;

    const brightness = (red + green + blue) / 3;
    const threshold = 128;

    if (brightness < threshold) {
        // Darker by 20%
        newRed = Math.min(Math.round(red + threshold * 0.2), 255);
        newGreen = Math.min(Math.round(green + threshold * 0.2), 255);
        newBlue = Math.min(Math.round(blue + threshold * 0.2), 255);
    } else {
        // Lighter by 20%
        newRed = Math.max(Math.round(red - threshold * 0.2), 0);
        newGreen = Math.max(Math.round(green - threshold * 0.2), 0);
        newBlue = Math.max(Math.round(blue - threshold * 0.2), 0);
    }

    // Convert RGB to Hex
    const newHex = rgbToHex(newRed, newGreen, newBlue);
    return newHex;
}

function intenseColor(hexcode) {
    const red = parseInt(hexcode.slice(1, 3), 16);
    const green = parseInt(hexcode.slice(3, 5), 16);
    const blue = parseInt(hexcode.slice(5, 7), 16);

    let newRed = red;
    let newGreen = green;
    let newBlue = blue;

    const brightness = (red + green + blue) / 3;
    const threshold = 128;

    if (brightness < threshold) {
        // Darker by 20%
        newRed = Math.max(Math.round(red - threshold * 0.2), 0);
        newGreen = Math.max(Math.round(green - threshold * 0.2), 0);
        newBlue = Math.max(Math.round(blue - threshold * 0.2), 0);
    } else {
        // Lighter by 20%
        newRed = Math.min(Math.round(red + threshold * 0.2), 255);
        newGreen = Math.min(Math.round(green + threshold * 0.2), 255);
        newBlue = Math.min(Math.round(blue + threshold * 0.2), 255);
    }

    // Convert RGB to Hex
    const newHex = rgbToHex(newRed, newGreen, newBlue);
    return newHex;
}

$(function () {
    'use strict';

    // Retrieve the background color value from the data attribute
    const customBackgroundColor = $('#custom-background-color').data('background-color');
    const customBodyColor = $('#custom-body-color').data('body-color');

    console.log('Custom background color:', customBackgroundColor);
    console.log('Custom body color:', customBodyColor);

    // Calculate the washed color using the function
    const backgroundWashedColorValue = washedColor(customBackgroundColor);
    const backgroundIntenseColorValue = intenseColor(customBackgroundColor);
    const regularWashedColorValue = washedColor(customBodyColor);
    const regularIntenseColorValue = intenseColor(customBodyColor);

    // Declarar variables CSS con los valores de washed-color e intense-color
    document.documentElement.style.setProperty("--background-washed-color", backgroundWashedColorValue);
    document.documentElement.style.setProperty("--background-intense-color", backgroundIntenseColorValue);
    document.documentElement.style.setProperty("--regular-washed-color", regularWashedColorValue);
    document.documentElement.style.setProperty("--regular-intense-color", regularIntenseColorValue);

    const backgroundIntenseColorValueRGBA = hexToRgba(backgroundIntenseColorValue, 0.32);
    document.documentElement.style.setProperty("--background-intense-dropdown-box-shadow", `0 0.4375rem 1.25rem ${backgroundIntenseColorValueRGBA}`);

});

$(function () {
    'use strict';
    cover();
    pagination(true);
    player();
});

function cover() {
    'use strict';

    var image = $('.cover-image');
    if (!image) return;

    image.imagesLoaded(function () {
        $('.site-cover').addClass('initialized');
    });
}

function player() {
    'use strict';
    var player = jQuery('.player');
    var playerAudio = jQuery('.player-audio');
    var playerProgress = jQuery('.player-progress');
    var timeCurrent = jQuery('.player-time-current');
    var timeDuration = jQuery('.player-time-duration');
    var playButton = jQuery('.button-play');
    var backwardButton = jQuery('.player-backward');
    var forwardButton = jQuery('.player-forward');
    var playerSpeed = 1;
    var speedButton = jQuery('.player-speed');

    jQuery('.site').on('click', '.js-play', function () {
        var clicked = jQuery(this);

        if (clicked.hasClass('post-play')) {
            var episode = clicked.closest('.post');
            if (player.attr('data-playing') !== episode.attr('data-id')) {
                playerAudio.attr('src', episode.attr('data-url'));
                jQuery('.post[data-id="' + player.attr('data-playing') + '"]').find('.post-play').removeClass('playing');
                player.attr('data-playing', episode.attr('data-id'));
                player.find('.post-image').attr('src', episode.find('.post-image').attr('src'));
                player.find('.post-title').text(episode.find('.post-title').text());
                player.find('.post-meta time').attr('datetime', episode.find('.post-meta-date time').attr('datetime'));
                player.find('.post-meta time').text(episode.find('.post-meta-date time').text());
            }
        }

        if (playerAudio[0].paused) {
            var playPromise = playerAudio[0].play();
            if (playPromise !== undefined) {
                playPromise
                    .then(function () {
                        clicked.addClass('playing');
                        playButton.addClass('playing');
                        jQuery('.post[data-id="' + player.attr('data-playing') + '"]').find('.post-play').addClass('playing');
                        jQuery('body').addClass('player-opened');
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        } else {
            playerAudio[0].pause();
            clicked.removeClass('playing');
            playButton.removeClass('playing');
            jQuery('.post[data-id="' + player.attr('data-playing') + '"]').find('.post-play').removeClass('playing');
        }
    });

    playerAudio.on('timeupdate', function () {
        const duration = isNaN(playerAudio[0].duration) ? 0 : playerAudio[0].duration;
        timeDuration.text(
            new Date(duration * 1000).toISOString().substring(11, 19)
        );
        playerAudio[0].addEventListener('timeupdate', function (e) {
            timeCurrent.text(
                new Date(e.target.currentTime * 1000)
                    .toISOString()
                    .substring(11, 19)
            );
            playerProgress.css(
                'width',
                (e.target.currentTime / playerAudio[0].duration) * 100 + '%'
            );
        });
    });

    backwardButton.on('click', function () {
        playerAudio[0].currentTime = playerAudio[0].currentTime - 10;
    });

    forwardButton.on('click', function () {
        playerAudio[0].currentTime = playerAudio[0].currentTime + 30;
    });

    speedButton.on('click', function () {
        if (playerSpeed < 2) {
            playerSpeed += 0.5;
        } else {
            playerSpeed = 1;
        }

        playerAudio[0].playbackRate = playerSpeed;
        speedButton.text(playerSpeed + 'x');
    });
}

