# HTML5 Video Subtitle

## Build status

TravisCI, `master` branch:

[![Build Status](https://travis-ci.org/noophq/html5-video-sync.svg?branch=master)](https://travis-ci.org/noophq/html5-video-sync)

## Introduction

This module is used to synchronize multiple videos.
There is one main video and multiple synced videos.
All actions (pause, play, sync) are synced from the main video the other ones.

## Prerequisites

1) NodeJS >= 7 (check with `node --version`)
2) NPM >= 5.3 (check with `npm --version`)

## Quick start

In html5-video-sync project

### Install html5-video-subtitle dependencies

`npm install`

### Start application in dev environment

`npm run start:dev`

### Start application in production environment

`npm start`

## Lint

It's very important (required) to launch lint before pushing any code on github repository

`npm run lint`

## Integration in your own code

### HTML

```
<!DOCTYPE html>
<html>
  <body>
    <video
      id="main-video"
      src="main-video.webm"
      width="640"
      controls autoplay>
    </video>
    <video
      id="synced-video"
      src="synced-video.webm"
      width="640"
      controls autoplay>
    </video>

    <script src="html5-video-sync.js"></script>
    <script src="app.js"></script>
  </body>
</html>
```

### app.js

```
function initPlayer() {
    var mainVideo = document.getElementById("main-video");
    var syncedVideo = document.getElementById("synced-video");

    videoSynchronizer.sync(
      mainVideo,
      syncedVideo
    );
}

document.addEventListener("DOMContentLoaded", initPlayer);
```

## API

### Events

synchronized
