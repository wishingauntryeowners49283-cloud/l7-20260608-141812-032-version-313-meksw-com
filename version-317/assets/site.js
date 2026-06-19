(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function bindCardFilter(form) {
        var input = form.querySelector('input');
        var list = document.querySelector('[data-filter-list]');
        if (!input || !list) {
            return;
        }

        function applyFilter() {
            var query = normalize(input.value);
            var cards = Array.prototype.slice.call(list.children);
            cards.forEach(function (card) {
                var haystack = normalize(card.textContent + ' ' + (card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-year') || '') + ' ' + (card.getAttribute('data-genre') || '') + ' ' + (card.getAttribute('data-region') || ''));
                card.classList.toggle('is-filter-hidden', query && haystack.indexOf(query) === -1);
            });
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });
        input.addEventListener('input', applyFilter);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-card-filter], [data-rank-filter]')).forEach(bindCardFilter);

    var categoryFilter = document.querySelector('[data-category-filter]');
    if (categoryFilter) {
        var categoryInput = categoryFilter.querySelector('input');
        var categoryCards = Array.prototype.slice.call(document.querySelectorAll('[data-category-card]'));
        var filterCategories = function () {
            var query = normalize(categoryInput.value);
            categoryCards.forEach(function (card) {
                var text = normalize(card.textContent);
                card.classList.toggle('is-filter-hidden', query && text.indexOf(query) === -1);
            });
        };

        categoryFilter.addEventListener('submit', function (event) {
            event.preventDefault();
            filterCategories();
        });
        categoryInput.addEventListener('input', filterCategories);
    }

    function initPlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-player-button]');
        var src = player.getAttribute('data-player-src');
        var loaded = false;
        var hlsInstance = null;

        if (!video || !button || !src) {
            return;
        }

        function start() {
            button.classList.add('is-hidden');

            if (!loaded) {
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    }, { once: true });
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = src;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);

    function renderSearch() {
        var resultBox = document.querySelector('[data-search-results]');
        var status = document.querySelector('[data-search-status]');
        var input = document.querySelector('[data-search-input]');

        if (!resultBox || !status || !window.MovieSearchIndex) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input) {
            input.value = query;
        }

        var words = normalize(query).split(/\s+/).filter(Boolean);
        if (!words.length) {
            return;
        }

        var results = window.MovieSearchIndex.filter(function (item) {
            var text = normalize([item.title, item.oneLine, item.genre, item.tags, item.region, item.type, item.year, item.category].join(' '));
            return words.every(function (word) {
                return text.indexOf(word) !== -1;
            });
        }).slice(0, 80);

        status.textContent = results.length ? '找到相关影视内容' : '没有找到匹配内容';
        resultBox.innerHTML = results.map(function (item) {
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
                '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async" />',
                '<span class="poster-badge">' + escapeHtml(item.year) + '</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<div class="movie-meta-line"><a href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a><span>' + escapeHtml(item.region) + '</span></div>',
                '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
                '<p>' + escapeHtml(item.oneLine) + '</p>',
                '<div class="tag-row">' + item.tags.split(',').slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
                '</div>',
                '</article>'
            ].join('');
        }).join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    renderSearch();
})();
