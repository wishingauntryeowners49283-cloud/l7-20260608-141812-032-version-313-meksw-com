(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const siteNav = document.querySelector('[data-site-nav]');

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function restartTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        restartTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restartTimer();
      });
    });

    showSlide(0);
    restartTimer();
  }

  const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));

  function applyFilter(input) {
    const scope = input.closest('section') || input.closest('[data-search-scope]') || document;
    const query = input.value.trim().toLowerCase();
    const cards = Array.from(scope.querySelectorAll('[data-search-card]'));
    let visible = 0;

    cards.forEach(function (card) {
      const text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
      const matched = !query || text.indexOf(query) !== -1;
      card.classList.toggle('is-filtered-out', !matched);
      if (matched) {
        visible += 1;
      }
    });

    const hint = scope.querySelector('[data-search-hint]');

    if (hint) {
      hint.textContent = query ? '已筛选出 ' + visible + ' 个匹配结果' : '输入关键词筛选当前页面影片';
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilter(input);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');

  if (query && searchInputs.length) {
    searchInputs[0].value = query;
    applyFilter(searchInputs[0]);
  }
})();
