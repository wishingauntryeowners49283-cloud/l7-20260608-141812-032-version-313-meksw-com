(function () {
  const wrap = document.querySelector('[data-player]');

  if (!wrap) {
    return;
  }

  const video = wrap.querySelector('video[data-stream]');
  const playButton = wrap.querySelector('[data-play-button]');
  let hlsInstance = null;
  let prepared = false;

  function hideButton() {
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
  }

  function showError() {
    if (playButton) {
      playButton.classList.remove('is-hidden');
      playButton.innerHTML = '<span class="play-icon">!</span><span>播放暂时不可用</span>';
    }
  }

  function startVideo() {
    if (!video) {
      return;
    }

    const stream = video.getAttribute('data-stream');

    if (!stream) {
      showError();
      return;
    }

    hideButton();

    if (prepared) {
      video.play().catch(showError);
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.play().catch(showError);
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);

      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(showError);
      });

      hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
          return;
        }

        showError();
      });

      return;
    }

    showError();
  }

  if (playButton) {
    playButton.addEventListener('click', startVideo);
  }

  video.addEventListener('click', function () {
    if (!prepared || video.paused) {
      startVideo();
    }
  });

  video.addEventListener('play', hideButton);
  video.addEventListener('error', showError);

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
