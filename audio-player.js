// Cargar la API de YouTube
const ytScript = document.createElement("script");
ytScript.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(ytScript);

let players = {};

function onYouTubeIframeAPIReady() {
  document.querySelectorAll('.youtube-audio-player').forEach(container => {
    const videoId = container.dataset.videoId;
    const uniqueId = 'yt-audio-' + videoId;
    const iframe = document.createElement('div');
    iframe.id = uniqueId;
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.overflow = 'hidden';
    container.appendChild(iframe);

    const controlsHTML = `
      <div class="controls">
        <button class="play-toggle">
          <img src="https://cdn-icons-png.flaticon.com/128/260/260446.png" alt="Play">
        </button>
        <span class="status">Pausado</span>
      </div>
      <div class="bars">
        <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
      </div>
      <div class="progress-container">
        <input type="range" class="progressBar" value="0" min="0" max="100" step="1">
        <div class="time-display"><span class="current">0:00</span> / <span class="total">0:00</span></div>
      </div>`;
    container.insertAdjacentHTML('beforeend', controlsHTML);

    const player = new YT.Player(uniqueId, {
      videoId,
      events: {
        onReady: (event) => {
          event.target.playVideo(); // Autoplay
          initControls(container, player);
        },
        onStateChange: e => handleState(container, player, e)
      },
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0
      }
    });

    players[uniqueId] = { player, container };
  });
}

function initControls(container, player) {
  const playBtn = container.querySelector('.play-toggle');
  const img = playBtn.querySelector('img');
  const progressBar = container.querySelector('.progressBar');
  const currentSpan = container.querySelector('.current');
  const totalSpan = container.querySelector('.total');
  const duration = player.getDuration();
  totalSpan.textContent = formatTime(duration);

  playBtn.addEventListener('click', () => {
    const state = player.getPlayerState();
    state === YT.PlayerState.PLAYING ? player.pauseVideo() : player.playVideo();
  });

  progressBar.addEventListener('input', () => {
    const newTime = (progressBar.value / 100) * duration;
    player.seekTo(newTime, true);
  });

  setInterval(() => {
    const currentTime = player.getCurrentTime();
    const percent = (currentTime / duration) * 100;
    progressBar.value = percent;
    currentSpan.textContent = formatTime(currentTime);
  }, 500);
}

function handleState(container, player, e) {
  const playBtn = container.querySelector('.play-toggle img');
  const statusText = container.querySelector('.status');
  const bars = container.querySelector('.bars');

  if (e.data === YT.PlayerState.PLAYING) {
    playBtn.src = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi3BunqX7InS8F6GQVkHAcAi2qatwat8Kf7K4QNKnu9ErtsdIivFht2sW4I26SzcemO8RIefs-75UXWiIpQFL4LCZ9ojGIDfV2sMZt28ljBpyeA_hUqM-tQZE2QqFJxcmR6DqIpCelvDkm-ZyVam07g5uNqQ713mwFSz77kLMtFpCfthWztdB2Cld8TKLPO/s1600/pausa.png";
    statusText.textContent = "Reproduciendo";
    statusText.classList.add("playing");
    bars.style.visibility = 'visible';
  } else {
    playBtn.src = "https://cdn-icons-png.flaticon.com/128/260/260446.png";
    statusText.textContent = "Pausado";
    statusText.classList.remove("playing");
    bars.style.visibility = 'hidden';
  }
}

function formatTime(sec) {
  sec = Math.floor(sec);
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min}:${s.toString().padStart(2, '0')}`;
}
