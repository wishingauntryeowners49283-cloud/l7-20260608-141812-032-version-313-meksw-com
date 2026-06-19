import { H as Hls } from './hls.js';

export function initMoviePlayer(url) {
  var video = document.getElementById('moviePlayer');
  var button = document.getElementById('moviePlayButton');
  var hls = null;

  if (!video || !button || !url) {
    return;
  }

  function hideButton() {
    button.classList.add('is-hidden');
  }

  function showButton() {
    if (!video.ended) {
      button.classList.remove('is-hidden');
    }
  }

  function playVideo() {
    hideButton();
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        showButton();
      });
    }
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  } else if (Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(url);
    hls.attachMedia(video);
  } else {
    button.disabled = true;
    button.classList.add('is-hidden');
  }

  button.addEventListener('click', playVideo);

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', hideButton);
  video.addEventListener('pause', showButton);
  video.addEventListener('ended', showButton);

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
