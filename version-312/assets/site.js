(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        start();
      });
    });
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function initFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
    if (!areas.length) {
      return;
    }
    areas.forEach(function (area) {
      var input = area.querySelector("[data-filter-input]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
      var clear = area.querySelector("[data-filter-clear]");
      var typeButtons = Array.prototype.slice.call(area.querySelectorAll("[data-filter-type]"));
      var yearButtons = Array.prototype.slice.call(area.querySelectorAll("[data-filter-year]"));
      var selects = Array.prototype.slice.call(area.querySelectorAll("[data-filter-select]"));
      var state = {
        text: "",
        type: "",
        year: ""
      };

      function apply() {
        cards.forEach(function (card) {
          var search = normalize(card.getAttribute("data-search"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var okText = !state.text || search.indexOf(state.text) !== -1;
          var okType = !state.type || cardType === normalize(state.type);
          var okYear = !state.year || cardYear === normalize(state.year);
          card.classList.toggle("is-hidden", !(okText && okType && okYear));
        });
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
          input.value = q;
          state.text = normalize(q);
        }
        input.addEventListener("input", function () {
          state.text = normalize(input.value);
          apply();
        });
      }

      typeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          state.type = button.getAttribute("data-filter-type") || "";
          typeButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });

      yearButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          state.year = button.getAttribute("data-filter-year") || "";
          yearButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });

      selects.forEach(function (select) {
        select.addEventListener("change", function () {
          var key = select.getAttribute("data-filter-select");
          state[key] = select.value;
          apply();
        });
      });

      if (clear) {
        clear.addEventListener("click", function () {
          state.text = "";
          state.type = "";
          state.year = "";
          if (input) {
            input.value = "";
          }
          selects.forEach(function (select) {
            select.value = "";
          });
          typeButtons.concat(yearButtons).forEach(function (button) {
            button.classList.remove("is-active");
          });
          apply();
        });
      }
      apply();
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
