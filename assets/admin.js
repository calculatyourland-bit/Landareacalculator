(function() {
    'use strict';

    const ADMIN_PASSWORD = 'admin123';
    let currentPosts = [];

    const elements = {
        loginSection: document.getElementById('loginSection'),
        adminPanel: document.getElementById('adminPanel'),
        loginBtn: document.getElementById('loginBtn'),
        logoutBtn: document.getElementById('logoutBtn'),
        adminPassword: document.getElementById('adminPassword'),
        postForm: document.getElementById('postForm'),
        postTitle: document.getElementById('postTitle'),
        postSlug: document.getElementById('postSlug'),
        postDescription: document.getElementById('postDescription'),
        postImage: document.getElementById('postImage'),
        postCategory: document.getElementById('postCategory'),
        postTags: document.getElementById('postTags'),
        postReadTime: document.getElementById('postReadTime'),
        postContent: document.getElementById('postContent'),
        livePreview: document.getElementById('livePreview'),
        jsonOutput: document.getElementById('jsonOutput'),
        copyJsonBtn: document.getElementById('copyJsonBtn'),
        downloadJsonBtn: document.getElementById('downloadJsonBtn'),
        postsList: document.getElementById('postsList'),
        exportAllBtn: document.getElementById('exportAllBtn')
    };

    // Check session
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showAdminPanel();
    }

    // Login
    if (elements.loginBtn) {
        elements.loginBtn.addEventListener('click', () => {
            if (elements.adminPassword.value === ADMIN_PASSWORD) {
                sessionStorage.setItem('adminLoggedIn', 'true');
                showAdminPanel();
            } else {
                alert('गलत पासवर्ड!');
            }
        });
    }

    // Logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminLoggedIn');
            location.reload();
        });
    }

    function showAdminPanel() {
        if (elements.loginSection) elements.loginSection.style.display = 'none';
        if (elements.adminPanel) elements.adminPanel.style.display = 'block';
        if (elements.logoutBtn) elements.logoutBtn.style.display = 'inline-block';
        loadExistingPosts();
    }

    // Auto-generate slug
    if (elements.postTitle) {
        elements.postTitle.addEventListener('input', () => {
            const title = elements.postTitle.value;
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            elements.postSlug.value = slug;
            updatePreview();
        });
    }

    // Update preview
    ['postTitle', 'postDescription', 'postImage', 'postCategory', 'postContent'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePreview);
    });

    function updatePreview() {
        if (!elements.livePreview) return;
        
        elements.livePreview.innerHTML = `
            <h3>👁️ लाइव प्रीव्यू</h3>
            <div class="blog-card" style="max-width:300px;">
                <div class="blog-card-image">
                    <img src="${elements.postImage.value || 'https://via.placeholder.com/300'}" 
                         alt="${elements.postTitle.value}" 
                         style="width:100%; height:150px; object-fit:cover;">
                </div>
                <div class="blog-card-content">
                    <h4>${elements.postTitle.value || 'शीर्षक'}</h4>
                    <p>${(elements.postDescription.value || 'विवरण').substring(0,100)}...</p>
                </div>
            </div>
        `;
    }

    // Generate JSON
    if (elements.postForm) {
        elements.postForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const post = {
                id: elements.postSlug.value || 'new-post',
                title: elements.postTitle.value,
                description: elements.postDescription.value,
                image: elements.postImage.value,
                date: new Date().toISOString().split('T')[0],
                category: elements.postCategory.value,
                readTime: parseInt(elements.postReadTime.value) || 3,
                author: 'मनीष कुमार',
                tags: elements.postTags.value.split(',').map(t => t.trim()).filter(t => t),
                content: elements.postContent.value
            };

            elements.jsonOutput.style.display = 'block';
            elements.jsonOutput.textContent = JSON.stringify(post, null, 2);
            elements.copyJsonBtn.style.display = 'inline-block';
            elements.downloadJsonBtn.style.display = 'inline-block';
        });
    }

    // Copy JSON
    if (elements.copyJsonBtn) {
        elements.copyJsonBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(elements.jsonOutput.textContent);
            alert('JSON कॉपी हो गया!');
        });
    }

    // Download single JSON
    if (elements.downloadJsonBtn) {
        elements.downloadJsonBtn.addEventListener('click', () => {
            const blob = new Blob([elements.jsonOutput.textContent], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'post.json';
            a.click();
        });
    }

    // Load existing posts
    async function loadExistingPosts() {
        try {
            const response = await fetch('../data/posts.json?t=' + Date.now());
            currentPosts = await response.json();
            
            if (elements.postsList) {
                elements.postsList.innerHTML = currentPosts.map(post => `
                    <div class="post-item">
                        <div>
                            <strong>${post.title}</strong><br>
                            <small>${post.date} | ${post.category}</small>
                        </div>
                        <div>
                            <button class="admin-btn" onclick="editPost('${post.id}')" style="padding:5px 15px;">✏️</button>
                            <button class="admin-btn" onclick="deletePost('${post.id}')" style="padding:5px 15px; background:#dc2626;">🗑️</button>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    // Export all
    if (elements.exportAllBtn) {
        elements.exportAllBtn.addEventListener('click', () => {
            const blob = new Blob([JSON.stringify(currentPosts, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'posts.json';
            a.click();
        });
    }

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    // Global functions for edit/delete
    window.editPost = function(postId) {
        const post = currentPosts.find(p => p.id === postId);
        if (post) {
            document.querySelector('[data-tab="new"]').click();
            elements.postTitle.value = post.title;
            elements.postSlug.value = post.id;
            elements.postDescription.value = post.description;
            elements.postImage.value = post.image;
            elements.postCategory.value = post.category;
            elements.postTags.value = (post.tags || []).join(', ');
            elements.postReadTime.value = post.readTime || 3;
            elements.postContent.value = post.content;
            updatePreview();
        }
    };

    window.deletePost = function(postId) {
        if (confirm('क्या आप वाकई इस पोस्ट को डिलीट करना चाहते हैं?')) {
            currentPosts = currentPosts.filter(p => p.id !== postId);
            alert('पोस्ट हटा दी गई। अब नया JSON डाउनलोड करके GitHub पर अपडेट करें।');
            loadExistingPosts();
        }
    };
})();
