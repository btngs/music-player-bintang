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
  let currentTrackIndex = 0;
  let isShuffleEnabled = false;

  const musicList = [
    {
      title: "Cause You Have To",
      artist: "LANY",
      path: "musics/LANY - 'Cause You Have To.mp3",
      duration: "4:10",
    },
    {
      title: "anything 4 u",
      artist: "LANY",
      path: "musics/LANY - anything 4 u.mp3",
      duration: "3:14",
    },
    {
      title: "Always",
      artist: "Rex Orange County",
      path: "musics/Rex Orange County - Always.mp3",
      duration: "3:17",
    },
    {
      title: "Best Friend",
      artist: "Rex Orange County",
      path: "musics/Rex Orange County - Best Friend.mp3",
      duration: "4:22",
    },
    {
      title: "Happiness",
      artist: "Rex Orange County",
      path: "musics/Rex Orange County - Happiness.mp3",
      duration: "4:39",
    },
    {
      title: "About You",
      artist: "The 1975",
      path: "musics/The 1975 - About You.mp3",
      duration: "5:26",
    },
    {
      title: "It's Not Living",
      artist: "The 1975",
      path: "musics/The 1975 - It's Not Living.mp3",
      duration: "4:08",
    },
    {
      title: "Robbers",
      artist: "The 1975",
      path: "musics/The 1975 - Robbers.mp3",
      duration: "4:14",
    },
  ];

  const audioPlayer = new Audio();

  function musiclistShow() {
    musicContainer.innerHTML = ""; 

    musicList.forEach(function(music, index){
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
      musicPlay.addEventListener('click', createMusicPlayHandler(music, index));

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
        const songObject = {
          title: file.name,
          artist: "Unknown Artist",
          fileData: file,
          duration: ""
        }
        storeMusic(songObject, function(){
          musiclistShow();  
          getAllSongs(function(songsFromDB){
            songsFromDB.forEach(function(song){
              const isExist = musicList.some(track => track.id === song.id)
              if (!isExist) {
                musicList.push(song);
              }
              musiclistShow(); 
            })
          });
        });   
    }
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
    if (typeof index === 'number' && index >= 0) {
      currentTrackIndex = index;
    }
    audioPlayer.src = music.path;
    audioPlayer.play();
    syncPlayIcons();
    updateTrackInfo(music);
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



  musiclistShow();

