  const mp3Upload = document.getElementById('mp3-upload');
  const trackTItle = document.querySelector('.track-title');
  const trackArtist = document.querySelector('.track-artist');
  const musicContainer = document.querySelector('.music-list-container');
  const progressBar = document.getElementById('progress-bar');
  const playpauseBtn = document.querySelector('.play-main');
  const nextTrack = document.querySelector('.play-next');
  const playAlbum = document.querySelector('.play-album');
  const shuffleAlbum = document.querySelector('.shuffle-album');
  const shuffleTrack = document.querySelector('.shuffle');
  const previousTrack = document.querySelector('.play-back');
  const repeatTrack = document.querySelector('.repeat');
  const volumeSlider = document.querySelector('.volume-controls');
  const search = document.getElementById('search-bar');

  let currentTrackIndex = 0;
  let isShuffleEnabled = false;

  let defaultMusic = [];
  let musicList = [];

  const audioPlayer = new Audio();

  function resolveMusicSource(music) {
    if (music.path) return music.path;
    if (music.fileData) return URL.createObjectURL(music.fileData);
    return "";
  }

  function normalizeMusic(music) {
    return {
      ...music,
      path: resolveMusicSource(music),
      duration: music.duration && music.duration !== "" ? music.duration : "0:00",
    };
  }

  function formatDuration(seconds) {
    if(isNaN(seconds) || seconds === Infinity) return "0:00";
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
      return `${minutes}:${formattedSeconds}`;
  }

  function musiclistShow(songsToRender = musicList) {
    musicContainer.innerHTML = ""; 

    songsToRender.forEach(function(rawMusic, index){
      const music = normalizeMusic(rawMusic);
      const article = document.createElement("article");
      article.className = "music-card"

      article.innerHTML = `
        <div class="card-left-block">
            <div class="cover-wrapper">
                <i class="fa-solid fa-compact-disc"></i>
                <button class="btn-play">
                    <i class="fa-solid fa-play"></i>
                </button>
            </div>
            <div class="track-details">
                <h3>${music.title}</h3>
                <p>${music.artist}</p>
            </div>
        </div>
        <div class="track-duration">${music.duration}</div>
      `;

      const musicPlay = article.querySelector('.btn-play');
      const originalIndex = musicList.findIndex(track => track.title === music.title);
      musicPlay.addEventListener('click', createMusicPlayHandler(music, originalIndex));

      musicContainer.appendChild(article);
    });
  };

  audioPlayer.addEventListener('timeupdate', onTimeUpdate);
  progressBar.addEventListener('input', onProgressInput);
  playpauseBtn.addEventListener('click', onPlayPauseClick);
  nextTrack.addEventListener('click', playNextTrack);
  previousTrack.addEventListener('click', playPreviousTrack);
  repeatTrack.addEventListener('click', loopTrack); 
  audioPlayer.addEventListener('ended', playNextTrack);
  volumeSlider.addEventListener('input', volumeControl);
  mp3Upload.addEventListener('change', uploadMusic);
  search.addEventListener('input', searchMusic);


  if (playAlbum) playAlbum.addEventListener('click', onPlayAlbumClick);
  if (shuffleAlbum) shuffleAlbum.addEventListener('click', onShuffleAlbumClick);
  if (shuffleTrack) shuffleTrack.addEventListener('click', onShuffleTrackClick);

  function uploadMusic(event) {
    const selectedFile = event.target.files;
    if (selectedFile.length > 0) {
        const file = selectedFile[0]
        if (!file.type.startsWith("audio/")) {
          alert("Please Upload an .mp3 files");
          return;
        }

        const tempAudio = new Audio;
        tempAudio.src = URL.createObjectURL(file);
        tempAudio.addEventListener('loadedmetadata', function() {
          const durationText = formatDuration(tempAudio.duration);
          console.log(durationText);
          const title = file.name.replace(/\.[^/.]+$/, "");
          const songObject = {
            title: title,
            artist: "Unknown Artist",
            fileData: file,
            duration: durationText,
          }

          URL.revokeObjectURL(tempAudio.src);

          storeMusic(songObject, function(){
            getAllSongs(function(songsFromDB){
              musicList = [...defaultMusic];
              songsFromDB.forEach(function(song){
                musicList.push(song);
              });
              musiclistShow(); 
            });
          });   
        });
      event.target.value = "";
    }
  }

  function searchMusic(event) {
    const searchTerm = event.target.value.toLowerCase();

    if (searchTerm === "") {
      musiclistShow();
      return;
    } 

    const filteredMusic = musicList.filter(function(music){
      const titleMatch = music.title.toLowerCase().includes(searchTerm);
      const artistMatch = music.artist.toLowerCase().includes(searchTerm);
      return titleMatch || artistMatch;
    });
    musiclistShow(filteredMusic);
  }

  function createMusicPlayHandler(music, index) {
    return function musicPlayHandler() {
      playTrack(music, index);
    };
  }

  function onTimeUpdate() {
    if (audioPlayer.duration) {
      const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBar.value = percentage;
    }
  }

  function onProgressInput() {
    if (!audioPlayer.duration) return;
    const targetDuration = (progressBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = targetDuration;
  }

  function onPlayPauseClick() {
    if (audioPlayer.paused) {
      audioPlayer.play();
    } else {
      audioPlayer.pause();
    }
    syncPlayIcons();
  }

  function onPlayAlbumClick() {
    if (musicList.length === 0) return;
    if (isShuffleEnabled) {
      playRandomTrack();
    } else {
      const trackIndex = currentTrackIndex >= 0 ? currentTrackIndex : 0;
      playTrack(musicList[trackIndex], trackIndex);
    }
  }

  function onShuffleAlbumClick() {
    if (!shuffleAlbum) return;
    isShuffleEnabled = !isShuffleEnabled;
    updateShuffleIcon();
  }

  function onShuffleTrackClick() {
    if (!shuffleTrack) return;
    isShuffleEnabled = !isShuffleEnabled;
    updateShuffleIcon();
  }

  function playTrack(music, index = -1) {
    const resolvedMusic = normalizeMusic(music);
    if (typeof index === 'number' && index >= 0) {
      currentTrackIndex = index;
    }
    audioPlayer.src = resolvedMusic.path;
    audioPlayer.play();
    syncPlayIcons();
    updateTrackInfo(resolvedMusic);
  }

  function playRandomTrack() {
    if (musicList.length === 0) return;
    const randomIndex = Math.floor(Math.random() * musicList.length);
    playTrack(musicList[randomIndex], randomIndex);
  }

  function playNextTrack() {
    if (isShuffleEnabled) {
      playRandomTrack();
      return;
    }

    if (currentTrackIndex < musicList.length - 1 ) {
      currentTrackIndex++;
    } else {
      currentTrackIndex = 0;
    }

    const nextMusic = musicList[currentTrackIndex];

    playTrack(nextMusic, currentTrackIndex);
  }

  function playPreviousTrack() {
    if (currentTrackIndex > 0) {
      currentTrackIndex--;
    } else {
      currentTrackIndex = musicList.length - 1;
    }

    const nextMusic = musicList[currentTrackIndex];

    playTrack(nextMusic, currentTrackIndex);
  }

  function loopTrack() {
    if (audioPlayer.loop === false) {
      audioPlayer.loop = true;
      repeatTrack.classList.add('active');
    } else {
      audioPlayer.loop = false;
      repeatTrack.classList.remove('active');
    }
  }

  function volumeControl(event) {
    const volume = event.target.value;
    audioPlayer.volume = volume;
  }

  function updateTrackInfo(music) {
    trackTItle.textContent = music.title;
    trackArtist.textContent = music.artist;
  }

  function updatePlayPauseIcon() {
    playpauseBtn.innerHTML = audioPlayer.paused ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-pause"></i>';
  }

  function updateAlbumPlayIcon() {
    if (!playAlbum) return;
    playAlbum.innerHTML = audioPlayer.paused ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-pause"></i>';
  }

  function updateShuffleIcon() {
    if (!shuffleAlbum) return;
    shuffleAlbum.classList.toggle('active', isShuffleEnabled);
    shuffleTrack.classList.toggle('active', isShuffleEnabled);
  }

  function syncPlayIcons() {
    updatePlayPauseIcon();
    updateAlbumPlayIcon();
  }

  fetch('musics.json')
    .then(response => response.json())
    .then(data => {
      defaultMusic = data;
      return window.dbReady;
    })
    .then(() => {
      getAllSongs(function(songsFromDB){
        musicList = [...defaultMusic];
        if (songsFromDB && songsFromDB.length > 0) {
          songsFromDB.forEach(function(song){
            musicList.push(song);
          })
        }
        musiclistShow();
      })
    })
    .catch(error => {
      console.error("Failed", error)
    });