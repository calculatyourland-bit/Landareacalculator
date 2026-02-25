(function() {
    'use strict';

    const elements = {
        splash: document.getElementById('splash'),
        postContainer: document.getElementById('postContainer'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        errorMessage: document.getElementById('errorMessage'),
        schemaJson: document.getElementById('schema-json')
    };

    window.addEventListener('load', () => {
        setTimeout(() => {
            if (elements.splash) {
                elements.splash.style.opacity = '0';
                setTimeout(() => elements.splash.style.display = 'none', 600);
            }
        }, 800);
        loadPost();
    });

    async function loadPost() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');

            if (!postId) {
                show404();
                return;
            }

            const response = await fetch('../data/posts.json?t=' + Date.now());
            const posts = await response.json();
            const post = posts.find(p => p.id === postId);

            if (!post) {
                show404();
                return;
            }

            renderPost(post);
            updateMetaTags(post);
            updateSchema(post);
            loadRelatedPosts(post, posts);
            
        } catch (error) {
            console.error('Error loading post:', error);
            showError('पोस्ट लोड करने में त्रुटि हुई।');
        }
    }

    function renderPost(post) {
        if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'none';
        
        elements.postContainer.innerHTML = `
            <div class="breadcrumb">
                <a href="../index.html">होम</a> › 
                <a href="blog.html">ब्लॉग</a> › 
                <span>${post.title}</span>
            </div>
            
            <article>
                <header class="post-header">
                    <h1>${post.title}</h1>
                    <div class="post-meta">
                        <span>📅 ${formatDate(post.date)}</span>
                        <span>📂 ${post.category}</span>
                        <span>⏱️ ${post.readTime || 3} मिनट पढ़ें</span>
                    </div>
                </header>
                
                <img src="${post.image}" alt="${post.title}" class="post-image" loading="lazy">
                
                <div class="post-content">
                    ${post.content}
                </div>
                
                <div class="post-tags">
                    ${(post.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
                
                <div class="share-buttons">
                    <h3>इसे शेयर करें:</h3>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="share-btn facebook">Facebook</a>
                    <a href="https://wa.me/?text=${encodeURIComponent(post.title + ' - ' + window.location.href)}" target="_blank" class="share-btn whatsapp">WhatsApp</a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}" target="_blank" class="share-btn twitter">Twitter</a>
                </div>
            </article>
            
            <div class="ad-container ad-in-article">विज्ञापन स्थान (Ad Space)</div>
            
            <div class="related-posts" id="relatedPosts"></div>
        `;
    }

    function updateMetaTags(post) {
        document.title = post.title + ' - किसान ब्लॉग';
        
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = post.description;

        const ogTags = {
            'og:title': post.title,
            'og:description': post.description,
            'og:image': post.image,
            'og:url': window.location.href,
            'twitter:title': post.title,
            'twitter:description': post.description,
            'twitter:image': post.image
        };

        Object.entries(ogTags).forEach(([prop, content]) => {
            let tag = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(prop.startsWith('og') ? 'property' : 'name', prop);
                document.head.appendChild(tag);
            }
            tag.content = content;
        });

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.href = window.location.href;
    }

    function updateSchema(post) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.description,
            "image": post.image,
            "datePublished": post.date,
            "author": {
                "@type": "Person",
                "name": post.author || "मनीष कुमार"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Land Area Calculator",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://yourdomain.com/logo.png"
                }
            },
            "mainEntityOfPage": window.location.href
        };

        if (elements.schemaJson) {
            elements.schemaJson.textContent = JSON.stringify(schema);
        }
    }

    function loadRelatedPosts(currentPost, allPosts) {
        const relatedContainer = document.getElementById('relatedPosts');
        if (!relatedContainer) return;

        const related = allPosts
            .filter(p => p.id !== currentPost.id && p.category === currentPost.category)
            .slice(0, 3);

        if (related.length === 0) {
            relatedContainer.style.display = 'none';
            return;
        }

        relatedContainer.innerHTML = `
            <h3>📌 संबंधित लेख</h3>
            <div class="related-grid">
                ${related.map(p => `
                    <div class="blog-card" style="margin:0;">
                        <div class="blog-card-image">
                            <img src="${p.image}" alt="${p.title}" loading="lazy">
                        </div>
                        <div class="blog-card-content" style="padding:15px;">
                            <h4 style="font-size:16px;">${p.title}</h4>
                            <a href="post.html?id=${p.id}" class="blog-read-more">पढ़ें →</a>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function show404() {
        if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'none';
        elements.postContainer.innerHTML = `
            <div class="not-found">
                <h2>404</h2>
                <p>😔 पोस्ट नहीं मिली</p>
                <a href="blog.html" class="admin-btn" style="margin-top:20px;">सभी लेख देखें</a>
            </div>
        `;
    }

    function showError(message) {
        if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'none';
        if (elements.errorMessage) {
            elements.errorMessage.style.display = 'block';
            elements.errorMessage.textContent = message;
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('hi-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }
})();
