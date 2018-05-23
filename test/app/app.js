//var manifestUri = "//bitdash-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd";
var mainManifestUri = "//www-itec.uni-klu.ac.at/ftp/datasets/DASHDataset2014/" +
"BigBuckBunny/6sec/BigBuckBunny_6s_simple_2014_05_09.mpd";
var syncedManifestUri = "//www-itec.uni-klu.ac.at/ftp/datasets/DASHDataset2014/" +
"BigBuckBunny/6sec/BigBuckBunny_6s_simple_2014_05_09.mpd";


function initApp() {
    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll();

    // Check to see if the browser supports the basic APIs Shaka needs.
    if (shaka.Player.isBrowserSupported()) {
        // Everything looks good!
        initPlayers();
    } else {
        // This browser does not have the minimum set of APIs we need.
        console.error("Browser not supported!");
    }
}

function initPlayers() {
    // Create player instances.
    var mainVideo = document.getElementById("main-video");
    var mainPlayer = new shaka.Player(mainVideo);

    var syncedVideo = document.getElementById("synced-video");
    var syncedPlayer = new shaka.Player(syncedVideo);

    videoSynchronizer.sync(mainVideo, [syncedVideo]);

    // Listen for buffering
    mainPlayer.addEventListener("buffering", () => {
        console.log("main video buffering");
    });
    syncedPlayer.addEventListener("buffering", () => {
        console.log("synced video buffering");
    });

    // Listen for error events.
    mainPlayer.addEventListener("error", onErrorEvent);
    syncedPlayer.addEventListener("error", onErrorEvent);

    // Load manifests.
    mainPlayer.load(mainManifestUri).then(function() {
        console.log("The video has now been loaded!");
    }).catch(onError);
    syncedPlayer.load(mainManifestUri).then(function() {
        console.log("The video has now been loaded!");
    }).catch(onError);
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
