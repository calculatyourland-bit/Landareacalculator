(function() {
    'use strict';

    const state = {
        posts: [],
        filteredPosts: [],
        currentPage: 1,
        postsPerPage: 9,
        currentCategory: 'all',
        searchTerm: ''
    };

    const elements = {
        splash: document.getElementById('splash'),
        blogGrid: document.getElementById('blogGrid'),
        categoryFilter: document.getElementById('categoryFilter'),
        searchInput: document.getElementById('searchInput'),
        pagination: document.getElementById('pagination'),
        totalPosts: document.getElementById('totalPosts'),
        totalCategories: document.getElementById('totalCategories'),
        featuredPost: document.getElementById('featuredPost')
    };

    // Splash screen
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (elements.splash) {
                elements.splash.style.opacity = '0';
                setTimeout(() => elements.splash.style.display = 'none', 600);
            }
        }, 800);
        loadPosts();
    });

    async function loadPosts() {
        try {
            const response = await fetch('../data/posts.json?t=' + Date.now());
            state.posts = await response.json();
            state.filteredPosts = [...state.posts];
            
            updateStats();
            renderCategories();
            renderFeatured();
            filterPosts();
            
        } catch (error) {
            console.error('Error loading posts:', error);
            showError('पोस्ट लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
        }
    }

    function updateStats() {
        if (elements.totalPosts) {
            elements.totalPosts.textContent = state.posts.length;
        }
        if (elements.totalCategories) {
            const categories = [...new Set(state.posts.map(p => p.category))];
            elements.totalCategories.textContent = categories.length;
        }
    }

    function renderCategories() {
        if (!elements.categoryFilter) return;
        
        const categories = ['all', ...new Set(state.posts.map(p => p.category))];
        elements.categoryFilter.innerHTML = categories.map(cat => `
            <button class="category-btn ${state.currentCategory === cat ? 'active' : ''}" 
                    data-category="${cat}">
                ${cat === 'all' ? 'सभी' : cat}
                (${cat === 'all' ? state.posts.length : state.posts.filter(p => p.category === cat).length})
            </button>
        `).join('');

        elements.categoryFilter.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                elements.categoryFilter.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentCategory = btn.dataset.category;
                state.currentPage = 1;
                filterPosts();
            });
        });
    }

    function renderFeatured() {
        if (!elements.featuredPost || state.posts.length === 0) return;
        
        const featured = state.posts[0];
        elements.featuredPost.innerHTML = `
            <div class="featured-post">
                <div class="featured-content">
                    <span class="featured-badge">🔥 खास लेख</span>
                    <h2>${featured.title}</h2>
                    <p>${featured.description}</p>
                    <div class="featured-meta">
                        <span>📅 ${formatDate(featured.date)}</span>
                        <span>⏱️ ${featured.readTime || 3} मिनट पढ़ें</span>
                    </div>
                    <a href="post.html?id=${featured.id}" class="featured-btn">पूरा लेख पढ़ें →</a>
                </div>
                <div class="featured-image">
                    <img src="${featured.image}" alt="${featured.title}" loading="lazy">
                </div>
            </div>
        `;
    }

    function filterPosts() {
        let filtered = [...state.posts];

        // Category filter
        if (state.currentCategory !== 'all') {
            filtered = filtered.filter(p => p.category === state.currentCategory);
        }

        // Search filter
        if (state.searchTerm) {
            const term = state.searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(term) || 
                p.description.toLowerCase().includes(term)
            );
        }

        state.filteredPosts = filtered;
        state.currentPage = 1;
        renderPosts();
    }

    function renderPosts() {
        if (!elements.blogGrid) return;

        const start = (state.currentPage - 1) * state.postsPerPage;
        const end = start + state.postsPerPage;
        const postsToShow = state.filteredPosts.slice(start, end);

        if (postsToShow.length === 0) {
            elements.blogGrid.innerHTML = '<div class="no-posts">😔 कोई लेख नहीं मिला</div>';
            renderPagination();
            return;
        }

        elements.blogGrid.innerHTML = postsToShow.map(post => `
            <article class="blog-card">
                <div class="blog-card-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                    <span class="blog-category">${post.category}</span>
                </div>
                <div class="blog-card-content">
                    <h3 class="blog-card-title">${post.title}</h3>
                    <p class="blog-card-excerpt">${post.description}</p>
                    <div class="blog-card-meta">
                        <span>📅 ${formatDate(post.date)}</span>
                        <span>⏱️ ${post.readTime || 3} मिनट</span>
                    </div>
                    <div class="blog-card-footer">
                        <a href="post.html?id=${post.id}" class="blog-read-more">पूरा पढ़ें →</a>
                    </div>
                </div>
            </article>
        `).join('');

        renderPagination();
    }

    function renderPagination() {
        if (!elements.pagination) return;

        const totalPages = Math.ceil(state.filteredPosts.length / state.postsPerPage);
        if (totalPages <= 1) {
            elements.pagination.innerHTML = '';
            return;
        }

        let html = '';
        
        if (state.currentPage > 1) {
            html += `<button class="pagination-btn" data-page="${state.currentPage - 1}">←</button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= state.currentPage - 2 && i <= state.currentPage + 2)) {
                html += `<button class="pagination-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === state.currentPage - 3 || i === state.currentPage + 3) {
                html += `<span class="pagination-btn" style="background:transparent;border:none;">...</span>`;
            }
        }

        if (state.currentPage < totalPages) {
            html += `<button class="pagination-btn pagination-next" data-page="${state.currentPage + 1}">अगला →</button>`;
        }

        elements.pagination.innerHTML = html;

        elements.pagination.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentPage = parseInt(btn.dataset.page);
                renderPosts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('hi-IN', options);
    }

    function showError(message) {
        if (elements.blogGrid) {
            elements.blogGrid.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }

    // Search input
    if (elements.searchInput) {
        let timeout;
        elements.searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                state.searchTerm = e.target.value;
                filterPosts();
            }, 300);
        });
    }

    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('धन्यवाद! अब आपको नए लेख मिलेंगे।');
            newsletterForm.reset();
        });
    }
})();
