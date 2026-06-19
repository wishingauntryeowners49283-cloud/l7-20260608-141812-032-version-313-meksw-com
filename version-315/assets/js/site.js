(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function encodeQuery(value) {
    return encodeURIComponent(String(value || "").trim());
  }

  function attachNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "./search.html?q=" + encodeQuery(query);
        }
      });
    });
  }

  function attachHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function attachCardFilter() {
    var input = document.querySelector("[data-card-filter]");
    var list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        card.hidden = query && text.indexOf(query) === -1;
      });
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<a class="tag-pill" href="./search.html?q=' + encodeQuery(tag) + '">' + escapeHtml(tag) + '</a>';
    }).join("");

    return '' +
      '<article class="movie-card">' +
        '<a class="card-cover" href="' + escapeHtml(movie.url) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="card-badge">' + escapeHtml(movie.type) + '</span>' +
          '<span class="card-play">▶</span>' +
        '</a>' +
        '<div class="card-body">' +
          '<div class="card-meta">' +
            '<span>' + escapeHtml(movie.region) + '</span>' +
            '<span>' + escapeHtml(movie.year) + '</span>' +
          '</div>' +
          '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.one) + '</p>' +
          '<div class="tag-list">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function attachSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.getElementById("search-results");
    var hot = document.querySelector("[data-hot-searches]");
    if (!form || !input || !results || !window.SITE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;

    function render(value) {
      var normalized = String(value || "").trim().toLowerCase();
      if (!normalized) {
        results.innerHTML = "";
        if (hot) {
          hot.style.display = "block";
        }
        return;
      }

      if (hot) {
        hot.style.display = "none";
      }

      var found = window.SITE_SEARCH_DATA.filter(function (movie) {
        var text = [movie.title, movie.one, movie.genre, movie.region, movie.type, movie.year, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        return text.indexOf(normalized) !== -1;
      });

      results.innerHTML = found.slice(0, 240).map(createSearchCard).join("");
      if (!found.length) {
        results.innerHTML = '<div class="hot-searches"><h2>未找到相关影片</h2><p>可以换一个关键词继续搜索，或返回分类片库浏览。</p></div>';
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var nextQuery = input.value.trim();
      if (nextQuery) {
        window.history.replaceState(null, "", "./search.html?q=" + encodeQuery(nextQuery));
      } else {
        window.history.replaceState(null, "", "./search.html");
      }
      render(nextQuery);
    });

    document.querySelectorAll("[data-search-word]").forEach(function (button) {
      button.addEventListener("click", function () {
        input.value = button.getAttribute("data-search-word") || "";
        form.dispatchEvent(new Event("submit", { cancelable: true }));
      });
    });

    render(query);
  }

  window.setupMoviePlayer = function (playUrl) {
    var video = document.querySelector("[data-video-player]");
    var shell = document.querySelector("[data-player-shell]");
    var button = document.querySelector("[data-play-button]");
    if (!video || !shell || !button || !playUrl) {
      return;
    }

    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(playUrl);
        hls.attachMedia(video);
      } else {
        video.src = playUrl;
      }

      attached = true;
    }

    function start() {
      attach();
      shell.classList.add("is-playing");
      video.controls = true;
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      start();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function () {
    attachNavigation();
    attachHero();
    attachCardFilter();
    attachSearchPage();
  });
})();
