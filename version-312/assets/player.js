(function () {
  function loadHls() {
    return new Promise(function (resolve) {
      if (window.Hls) {
        resolve(true);
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
      script.onload = function () {
        resolve(Boolean(window.Hls));
      };
      script.onerror = function () {
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-player-button]");
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function setPlaying() {
      if (cover) {
        cover.classList.add("is-playing");
      }
      video.setAttribute("controls", "controls");
    }

    function attachWithHls() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }
      return loadHls().then(function (loaded) {
        if (loaded && window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      });
    }

    function play() {
      setPlaying();
      attachWithHls().then(function () {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            video.setAttribute("controls", "controls");
          });
        }
      });
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (cover) {
      cover.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        play();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
