(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('[data-player-trigger]');
    var status = shell.querySelector('[data-player-status]');
    var source = video ? video.getAttribute('data-hls-url') : '';
    var hlsInstance = null;
    var ready = false;

    if (!video || !source) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function attachSource() {
      if (ready) {
        return;
      }

      ready = true;
      setStatus('播放源加载中');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('高清播放');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('高清播放');
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源连接中');
          }
        });

        window.addEventListener('beforeunload', function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
        return;
      }

      video.src = source;
      setStatus('高清播放');
    }

    function start() {
      attachSource();
      shell.classList.add('is-started');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('点击视频继续播放');
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
  });
})();
