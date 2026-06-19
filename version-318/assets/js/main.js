(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.getElementById('mobileNav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFilter() {
    var input = document.querySelector('[data-local-filter]');
    var list = document.querySelector('[data-filter-list]');

    if (!input || !list) {
      return;
    }

    var items = Array.prototype.slice.call(list.querySelectorAll('.movie-card-item'));
    var empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '未找到匹配影片';

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;

      items.forEach(function (item) {
        var text = ((item.getAttribute('data-title') || '') + ' ' + (item.getAttribute('data-meta') || '')).toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        item.classList.toggle('is-filtered-out', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (!visible && !empty.parentNode) {
        list.appendChild(empty);
      }

      if (visible && empty.parentNode) {
        empty.parentNode.removeChild(empty);
      }
    });
  }

  function getSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearch() {
    var results = document.getElementById('searchResults');
    var title = document.getElementById('searchTitle');
    var input = document.getElementById('searchPageInput');

    if (!results || typeof SEARCH_MOVIES === 'undefined') {
      return;
    }

    var query = getSearchQuery();

    if (input) {
      input.value = query;
    }

    if (!query) {
      return;
    }

    var lower = query.toLowerCase();
    var matched = SEARCH_MOVIES.filter(function (movie) {
      return movie.search.toLowerCase().indexOf(lower) !== -1;
    });

    if (title) {
      title.textContent = '搜索结果：' + query;
    }

    if (!matched.length) {
      results.innerHTML = '<div class="empty-state">未找到匹配影片</div>';
      return;
    }

    results.innerHTML = matched.map(function (movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card-item">' +
        '<a class="movie-card" href="./' + escapeHtml(movie.file) + '">' +
        '<div class="poster-frame">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="poster-image" loading="lazy" decoding="async" onerror="this.style.opacity=\'0\'">' +
        '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
        '</div>' +
        '<div class="movie-card-body">' +
        '<div class="movie-eyebrow">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>' +
        '<h3>' + escapeHtml(movie.title) + '</h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</a>' +
        '</article>';
    }).join('');
  }

  setupHero();
  setupLocalFilter();
  renderSearch();
})();
