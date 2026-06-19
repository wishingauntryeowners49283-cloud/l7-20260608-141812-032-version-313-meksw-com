(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      button.setAttribute('aria-expanded', String(open));
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        var active = position === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-slide') || 0));
        start();
      });
    });
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid'));
    if (!grids.length) {
      return;
    }
    var keywordInput = document.querySelector('.movie-filter-input');
    var categorySelect = document.querySelector('.movie-category-select');
    var sortSelect = document.querySelector('.movie-sort-select');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (keywordInput && query) {
      keywordInput.value = query;
    }
    function cards() {
      return Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    }
    function filter() {
      var keyword = normalize(keywordInput ? keywordInput.value : '');
      var category = normalize(categorySelect ? categorySelect.value : '');
      cards().forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var categoryMatch = !category || haystack.indexOf(category) !== -1;
        card.classList.toggle('hidden-card', !(keywordMatch && categoryMatch));
      });
    }
    function sortCards() {
      if (!sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      grids.forEach(function (grid) {
        var sorted = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        sorted.sort(function (a, b) {
          if (mode === 'score-desc') {
            return Number(b.dataset.score) - Number(a.dataset.score);
          }
          if (mode === 'title-asc') {
            return a.querySelector('h2').innerText.localeCompare(b.querySelector('h2').innerText, 'zh-Hans-CN');
          }
          return Number(b.dataset.year) - Number(a.dataset.year);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      });
      filter();
    }
    if (keywordInput) {
      keywordInput.addEventListener('input', filter);
    }
    if (categorySelect) {
      categorySelect.addEventListener('change', filter);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }
    sortCards();
    filter();
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
