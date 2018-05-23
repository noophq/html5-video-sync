// var manifestUri = "//bitdash-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd";
var manifestUri = "//www-itec.uni-klu.ac.at/ftp/datasets/DASHDataset2014/" +
    "BigBuckBunny/6sec/BigBuckBunny_6s_simple_2014_05_09.mpd";

function initApp() {
    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll();

    // Check to see if the browser supports the basic APIs Shaka needs.
    if (shaka.Player.isBrowserSupported()) {
        // Everything looks good!
        initPlayer();
    } else {
        // This browser does not have the minimum set of APIs we need.
        console.error("Browser not supported!");
    }
}

function initPlayer() {
    // Create a Player instance.
    var video = document.getElementById("video");
    const sPlayer = subtitlePlayer.wrap(video);
    var fullscreenButton = document.getElementById("video-fullscreen");
    fullscreenButton.addEventListener("click", (event) => {
        sPlayer.requestFullscreen();
    });

    sPlayer.displayTextTrack("test.xml");

    var player = new shaka.Player(video);

    // Attach player to the window to make it easy to access in the JS console.
    window.player = player;

    // Listen for error events.
    player.addEventListener("error", onErrorEvent);

    // Try to load a manifest.
    // This is an asynchronous process.
    player.load(manifestUri).then(function() {
        // This runs if the asynchronous load is successful.
        console.log("The video has now been loaded!");
    }).catch(onError);  // onError is executed if the asynchronous load fails.
}

function onErrorEvent(event) {
    // Extract the shaka.util.Error object from the event.
    onError(event.detail);
}

function onError(error) {
    // Log the error.
    console.error("Error code", error.code, "object", error);
}

document.addEventListener("DOMContentLoaded", initApp);
