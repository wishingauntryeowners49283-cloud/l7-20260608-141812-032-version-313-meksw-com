(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-card-search]');
  var cardList = document.querySelector('[data-card-list]');
  var activeRegion = 'all';
  var activeYear = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function refreshCards() {
    if (!cardList) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' '));
      var regionMatch = activeRegion === 'all' || card.getAttribute('data-region') === activeRegion;
      var yearMatch = activeYear === 'all' || card.getAttribute('data-year') === activeYear;
      var queryMatch = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !(regionMatch && yearMatch && queryMatch));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', refreshCards);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-region-filter] button')).forEach(function (button) {
    button.addEventListener('click', function () {
      Array.prototype.slice.call(button.parentElement.querySelectorAll('button')).forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      activeRegion = button.getAttribute('data-filter-region') || 'all';
      refreshCards();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-year-filter] button')).forEach(function (button) {
    button.addEventListener('click', function () {
      Array.prototype.slice.call(button.parentElement.querySelectorAll('button')).forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      activeYear = button.getAttribute('data-filter-year') || 'all';
      refreshCards();
    });
  });
})();
