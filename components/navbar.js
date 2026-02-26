(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    scrollThreshold: 50,
    hiddenClass: 'hidden',
    activeClass: 'active'
  };

  // State
  let navContainer = null;
  let lastScrollY = 0;
  let ticking = false;
  let isInitialized = false;

  // Initialize navbar
  function initNavbar() {
    if (isInitialized) return;
    
    // Get navbar container
    navContainer = document.querySelector('.bottom-nav-container');
    if (!navContainer) {
      console.warn('Navbar container not found');
      return;
    }

    // Set body padding
    document.body.style.paddingBottom = '90px';
    
    // Set active nav item based on current page
    setActiveNavItem();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Add click listeners for smooth navigation
    setupNavigation();
    
    // Handle back/forward cache
    window.addEventListener('pageshow', handlePageShow);
    
    isInitialized = true;
    console.log('Navbar initialized successfully');
  }

  // Set active nav item - FIXED VERSION
  function setActiveNavItem() {
    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';
    const fullPath = window.location.href;
    
    console.log('Current page:', currentPage);
    console.log('Full path:', fullPath);
    
    // Remove active class from all
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove(CONFIG.activeClass);
    });
    
    // Check if we're on blog page - MULTIPLE CONDITIONS
    const isBlogPage = 
      currentPage === 'blog.html' || 
      currentPage === '' && path.includes('/blog/') ||
      fullPath.includes('/blog/blog.html') ||
      fullPath.includes('/blog/') && currentPage === 'post.html' ||
      document.querySelector('[data-nav="blog"]')?.getAttribute('href') === window.location.href;
    
    if (isBlogPage) {
      console.log('Blog page detected - activating blog button');
      document.querySelector('[data-nav="blog"]')?.classList.add(CONFIG.activeClass);
      return;
    }
    
    // Set active based on current page
    if (currentPage === '' || currentPage === 'index.html' || path.endsWith('/')) {
      document.querySelector('[data-nav="home"]')?.classList.add(CONFIG.activeClass);
    } else if (currentPage === 'khet-kshetrafal.html') {
      document.querySelector('[data-nav="area"]')?.classList.add(CONFIG.activeClass);
    } else if (currentPage === 'dismil-kattha.html') {
      document.querySelector('[data-nav="dismil"]')?.classList.add(CONFIG.activeClass);
    } else {
      // Default to home
      document.querySelector('[data-nav="home"]')?.classList.add(CONFIG.activeClass);
    }
  }

  // Handle scroll with animation frame
  function handleScroll() {
    if (!navContainer) return;
    
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        
        // Show/hide based on scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > CONFIG.scrollThreshold) {
          navContainer.classList.add(CONFIG.hiddenClass);
        } else {
          navContainer.classList.remove(CONFIG.hiddenClass);
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
      });
      
      ticking = true;
    }
  }

  // Setup navigation clicks
  function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip if it's the current page
        if (href === window.location.pathname || 
            href === window.location.pathname.split('/').pop()) {
          e.preventDefault();
          return;
        }
        
        // Add active class to clicked item
        document.querySelectorAll('.nav-item').forEach(nav => {
          nav.classList.remove(CONFIG.activeClass);
        });
        this.classList.add(CONFIG.activeClass);
        
        // Add page transition
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.classList.add('page-transition');
        }
        
        // Navigate after short delay
        e.preventDefault();
        setTimeout(() => {
          window.location.href = href;
        }, 200);
      });
    });
  }

  // Handle page show (for back/forward cache)
  function handlePageShow(event) {
    if (event.persisted) {
      setTimeout(() => {
        setActiveNavItem();
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.classList.remove('page-transition');
        }
        if (navContainer) {
          navContainer.classList.remove(CONFIG.hiddenClass);
        }
      }, 50);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }

  // Re-run on page load (for dynamic content)
  window.addEventListener('load', function() {
    setTimeout(initNavbar, 100);
  });

  // Run again after 500ms to be sure
  setTimeout(() => {
    setActiveNavItem();
  }, 500);

})();
