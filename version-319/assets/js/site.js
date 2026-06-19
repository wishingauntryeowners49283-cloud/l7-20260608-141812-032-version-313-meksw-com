(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupImages() {
        document.querySelectorAll('img[data-fallback-image]').forEach(function (image) {
            if (image.complete && image.naturalWidth === 0) {
                image.classList.add('is-hidden');
            }
            image.addEventListener('error', function () {
                image.classList.add('is-hidden');
            });
        });
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var next = slider.querySelector('[data-hero-next]');
        var prev = slider.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        function show(index) {
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

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupSiteSearch() {
        var forms = document.querySelectorAll('[data-site-search]');
        var panel = document.querySelector('[data-search-panel]');
        var index = window.MOVIE_SEARCH_INDEX || [];
        if (!forms.length || !panel || !index.length) {
            return;
        }

        function closePanel() {
            panel.classList.remove('is-open');
            panel.innerHTML = '';
        }

        function renderResults(query) {
            var q = normalize(query);
            if (!q) {
                closePanel();
                return;
            }
            var results = index.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category,
                    movie.tags
                ].join(' '));
                return haystack.indexOf(q) !== -1;
            }).slice(0, 20);

            var html = '';
            html += '<div class="search-panel-header">';
            html += '<strong>搜索“' + escapeHtml(query) + '” · ' + results.length + ' 条结果</strong>';
            html += '<button type="button" data-close-search>关闭</button>';
            html += '</div>';
            if (!results.length) {
                html += '<div class="search-result-item"><div class="search-result-index">0</div><div><h3>没有找到匹配影片</h3><p>可以尝试输入标题、地区、年份或类型关键词。</p></div></div>';
            } else {
                results.forEach(function (movie, resultIndex) {
                    html += '<a class="search-result-item" href="' + escapeHtml(resolveSiteUrl(movie.url)) + '">';
                    html += '<span class="search-result-index">' + String(resultIndex + 1).padStart(2, '0') + '</span>';
                    html += '<span><h3>' + escapeHtml(movie.title) + '</h3>';
                    html += '<p>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type + ' · ' + movie.category) + '</p></span>';
                    html += '</a>';
                });
            }
            panel.innerHTML = html;
            panel.classList.add('is-open');
            var closeButton = panel.querySelector('[data-close-search]');
            if (closeButton) {
                closeButton.addEventListener('click', closePanel);
            }
        }

        forms.forEach(function (form) {
            var input = form.querySelector('input[type="search"]');
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                renderResults(input ? input.value : '');
            });
            if (input) {
                input.addEventListener('input', function () {
                    renderResults(input.value);
                });
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closePanel();
            }
        });
    }


    function resolveSiteUrl(url) {
        var value = String(url || '');
        if (!value || /^(https?:|\/|#)/.test(value)) {
            return value;
        }
        return getRelativePrefix() + value.replace(/^\.\//, '');
    }

    function getRelativePrefix() {
        var path = window.location.pathname || '';
        if (path.indexOf('/movie/') !== -1 || path.indexOf('/categories/') !== -1) {
            return '../';
        }
        return './';
    }

    function setupGridFilters() {
        var bar = document.querySelector('[data-filter-bar]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        if (!bar || !cards.length) {
            return;
        }
        var search = bar.querySelector('[data-filter-search]');
        var typeSelect = bar.querySelector('[data-filter-type]');
        var regionSelect = bar.querySelector('[data-filter-region]');
        var yearSelect = bar.querySelector('[data-filter-year]');
        var reset = bar.querySelector('[data-filter-reset]');
        var count = bar.querySelector('[data-filter-count]');

        function fillSelect(select, values) {
            if (!select) {
                return;
            }
            values.sort(function (a, b) {
                return a.localeCompare(b, 'zh-CN');
            }).forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        fillSelect(typeSelect, uniqueValues(cards, 'type'));
        fillSelect(regionSelect, uniqueValues(cards, 'region'));

        function apply() {
            var q = normalize(search ? search.value : '');
            var type = typeSelect ? typeSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var yearBucket = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                var year = parseInt(card.dataset.year || '0', 10);
                var matchesQuery = !q || text.indexOf(q) !== -1;
                var matchesType = !type || card.dataset.type === type;
                var matchesRegion = !region || card.dataset.region === region;
                var matchesYear = matchYearBucket(year, yearBucket);
                var show = matchesQuery && matchesType && matchesRegion && matchesYear;
                card.classList.toggle('is-hidden-by-filter', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' / ' + cards.length;
            }
        }

        [search, typeSelect, regionSelect, yearSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (search) {
                    search.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                if (regionSelect) {
                    regionSelect.value = '';
                }
                if (yearSelect) {
                    yearSelect.value = '';
                }
                apply();
            });
        }

        apply();
    }

    function uniqueValues(cards, key) {
        var values = [];
        var seen = Object.create(null);
        cards.forEach(function (card) {
            var value = card.dataset[key];
            if (value && !seen[value]) {
                seen[value] = true;
                values.push(value);
            }
        });
        return values;
    }

    function matchYearBucket(year, bucket) {
        if (!bucket) {
            return true;
        }
        if (bucket === '2025') {
            return year >= 2025;
        }
        if (bucket === '2020') {
            return year >= 2020 && year <= 2024;
        }
        if (bucket === '2010') {
            return year >= 2010 && year <= 2019;
        }
        if (bucket === '2000') {
            return year >= 2000 && year <= 2009;
        }
        if (bucket === '1990') {
            return year >= 1990 && year <= 1999;
        }
        if (bucket === '1980') {
            return year > 0 && year < 1990;
        }
        return true;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    ready(function () {
        setupImages();
        setupMobileMenu();
        setupHero();
        setupSiteSearch();
        setupGridFilters();
    });
})();
