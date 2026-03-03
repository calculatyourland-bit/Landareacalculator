// components/footer.js
(function() {
    // Load CSS
    function loadCSS() {
        if (!document.getElementById('footer-css')) {
            const link = document.createElement('link');
            link.id = 'footer-css';
            link.rel = 'stylesheet';
            link.href = '/components/footer.css';
            document.head.appendChild(link);
        }
    }

    // Load HTML
    function loadHTML() {
        if (document.querySelector('.blog-footer')) return;

        fetch('/components/footer.html')
            .then(response => response.text())
            .then(html => {
                let container = document.getElementById('footer-container');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'footer-container';
                    document.body.appendChild(container);
                }
                container.innerHTML = html;
                
                // Update year
                const yearSpan = document.getElementById('currentYear');
                if (yearSpan) {
                    yearSpan.textContent = new Date().getFullYear();
                }
            })
            .catch(err => console.log('Footer error:', err));
    }

    // Run
    loadCSS();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHTML);
    } else {
        loadHTML();
    }
})();
