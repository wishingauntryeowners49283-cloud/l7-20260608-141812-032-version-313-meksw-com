const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileMenu() {
    const button = qs("[data-mobile-toggle]");
    const panel = qs("[data-mobile-panel]");
    if (!button || !panel) {
        return;
    }
    button.addEventListener("click", () => {
        const open = panel.classList.toggle("is-open");
        button.setAttribute("aria-expanded", open ? "true" : "false");
    });
}

function setupHeaderSearch() {
    qsa("[data-site-search]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = qs("input", form);
            const value = input ? input.value.trim() : "";
            if (value) {
                window.location.href = `search.html?q=${encodeURIComponent(value)}`;
            } else {
                window.location.href = "search.html";
            }
        });
    });
}

function setupHeroSlider() {
    const slider = qs("[data-hero-slider]");
    if (!slider) {
        return;
    }

    const slides = qsa(".hero-slide", slider);
    const dots = qsa(".hero-dot", slider);
    if (!slides.length) {
        return;
    }

    let current = 0;

    function activate(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex % slides.length === current);
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => activate(index));
    });

    activate(0);
    window.setInterval(() => activate(current + 1), 5200);
}

function parseRange(value) {
    if (!value || value === "all") {
        return [0, 9999];
    }
    if (value === "earlier") {
        return [0, 2019];
    }
    const year = Number.parseInt(value, 10);
    return [year, year];
}

function setupCardFilters() {
    const scope = qs("[data-filter-scope]");
    if (!scope) {
        return;
    }

    const cards = qsa("[data-card]", scope);
    const keywordInput = qs("[data-filter-keyword]", scope);
    const yearSelect = qs("[data-filter-year]", scope);
    const categorySelect = qs("[data-filter-category]", scope);
    const regionSelect = qs("[data-filter-region]", scope);
    const emptyState = qs("[data-empty-state]", scope);

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query && keywordInput) {
        keywordInput.value = query;
    }

    function apply() {
        const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
        const [fromYear, toYear] = parseRange(yearSelect ? yearSelect.value : "all");
        const category = categorySelect ? categorySelect.value : "all";
        const region = regionSelect ? regionSelect.value : "all";
        let visible = 0;

        cards.forEach((card) => {
            const haystack = (card.getAttribute("data-search") || "").toLowerCase();
            const year = Number.parseInt(card.getAttribute("data-year") || "0", 10);
            const cardCategory = card.getAttribute("data-category") || "";
            const cardRegion = card.getAttribute("data-region") || "";
            const keywordMatch = !keyword || haystack.includes(keyword);
            const yearMatch = year >= fromYear && year <= toYear;
            const categoryMatch = category === "all" || cardCategory === category;
            const regionMatch = region === "all" || cardRegion === region;
            const show = keywordMatch && yearMatch && categoryMatch && regionMatch;
            card.style.display = show ? "" : "none";
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    [keywordInput, yearSelect, categorySelect, regionSelect].forEach((control) => {
        if (!control) {
            return;
        }
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
    });

    apply();
}

setupMobileMenu();
setupHeaderSearch();
setupHeroSlider();
setupCardFilters();
