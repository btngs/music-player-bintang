# Music Player

A simple web-based music player with plain HTML, CSS, and JavaScript.

## Features
-------------------------------------------------------------------------
Offline Playback: Play your desired music without even worrying about connection
Local Caching: Caches your music locally for quick access
.mp3 Upload: Upload .mp3 format music directly to the player
Playback Controls: Play, pause, next, previous, shuffle, loop
Progress Tracking: Real-time playback progress

## Project Structures
---------------------------------------------------------------------------
- `index.html` - main page markup
- `style.css` - application styling
- `script.js` - player logic, rendering, and playback control
- `indexeddb.js` - IndexedDB helpers for saving and reading songs
- `musics/` - bundled sample audio files

## How It Works
-------------------------------------------------------
This app uses two kinds of music sources:
1. Built-in sample tracks from the `musics/` folder
2. Local files uploaded through the file input

Uploaded files are stored in IndexedDB so they can be loaded again after refreshed.

## Running The Project
Recommended options:
1. Using [this](https://btngs-mplayer.netlify.app/) link to open the app
2. Install the .zip file and extract it to your computer, then run the `index.html` directly to your browser using live server extension.

