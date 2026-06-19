(function () {
  function toggleMobileMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll('img[data-fallback-image]').forEach(function (image) {
      image.addEventListener('error', function () {
        var wrap = image.closest('.poster-wrap, .hero-poster');
        if (wrap) {
          wrap.classList.add('is-missing');
        }
        image.remove();
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    show(0);

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var fields = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-field]'));
      var clear = panel.querySelector('[data-clear-filter]');
      var empty = panel.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var activeFilters = fields.map(function (field) {
          return {
            name: field.getAttribute('data-filter-field'),
            value: normalize(field.value)
          };
        }).filter(function (item) {
          return item.value;
        });
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesFilters = activeFilters.every(function (filter) {
            return normalize(card.getAttribute('data-' + filter.name)).indexOf(filter.value) !== -1;
          });
          var visible = matchesQuery && matchesFilters;

          card.hidden = !visible;

          if (visible) {
            shown += 1;
          }
        });

        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      fields.forEach(function (field) {
        field.addEventListener('change', apply);
      });

      if (clear) {
        clear.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          fields.forEach(function (field) {
            field.value = '';
          });
          apply();
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMobileMenu();
    setupImageFallbacks();
    setupHero();
    setupFilters();
  });
})();
