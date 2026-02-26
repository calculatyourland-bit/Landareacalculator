// Bottom Navigation Bar Component - IIFE to avoid global pollution
(function() {
  'use strict';

  // Configuration
  const NAV_CONFIG = {
    containerClass: 'bottom-nav-container',
    navClass: 'bottom-nav',
    activeClass: 'active',
    hiddenClass: 'hidden',
    scrollThreshold: 50,
    navMap: {
      'index.html': 'home',
      '': 'home',
      'khet-kshetrafal.html': 'area',
      'dismil-kattha.html': 'dismil',
      'blog.html': 'blog'
    }
  };

  // State
  let navContainer = null;
  let lastScrollY = 0;
  let ticking = false;
  let isInitialized = false;

  // Helper: Get current page filename
  function getCurrentPage() {
    const path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
  }

  // Helper: Determine active nav item based on current page
  function getActiveNavId(currentPage) {
    // Handle root/index
    if (currentPage === '' || currentPage === 'index.html' || currentPage === '/') {
      return 'home';
    }
    
    // Map page to nav ID
    return NAV_CONFIG.navMap[currentPage] || 'home'; // Default to home if not found
  }

  // Set active class on nav items
  function setActiveNavItem() {
    const currentPage = getCurrentPage();
    const activeId = getActiveNavId(currentPage);
    
    // Find all nav items
    const navItems = document.querySelectorAll('.nav-item');
    if (!navItems.length) return;
    
    // Remove active class from all
    navItems.forEach(item => {
      item.classList.remove(NAV_CONFIG.activeClass);
    });
    
    // Add active class to matching item
    navItems.forEach(item => {
      const navAttr = item.getAttribute('data-nav');
      if (navAttr === activeId) {
        item.classList.add(NAV_CONFIG.activeClass);
      }
    });
  }

  // Scroll handler with throttle
  function handleScroll() {
    if (!navContainer) return;
    
    const currentScrollY = window.scrollY;
    
    // Skip if scroll change is too small
    if (Math.abs(currentScrollY - lastScrollY) < 10) {
      ticking = false;
      return;
    }
    
    // Show/hide based on scroll direction
    if (currentScrollY > lastScrollY && currentScrollY > NAV_CONFIG.scrollThreshold) {
      navContainer.classList.add(NAV_CONFIG.hiddenClass);
    } else {
      navContainer.classList.remove(NAV_CONFIG.hiddenClass);
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  }

  // Throttled scroll listener
  function initScrollListener() {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  // Handle page show event (for back/forward cache)
  function handlePageShow(event) {
    if (event.persisted) {
      // Restore from bfcache - reinitialize
      setTimeout(() => {
        setActiveNavItem();
        
        // Remove any transition artifacts
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.classList.remove('page-transition');
        }
      }, 50);
    }
  }

  // Handle navigation clicks with smooth transition
  function handleNavClick(event) {
    const target = event.target.closest('.nav-item');
    if (!target) return;
    
    const href = target.getAttribute('href');
    if (!href || href === '#') return;
    
    // Don't prevent default for external links or if it's the same page
    if (href === window.location.pathname || href === window.location.pathname.split('/').pop()) {
      event.preventDefault();
      return;
    }
    
    // For same-origin navigation, add smooth transition
    if (href.startsWith('/') || !href.includes('://')) {
      event.preventDefault();
      
      // Add active class to clicked item
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove(NAV_CONFIG.activeClass);
      });
      target.classList.add(NAV_CONFIG.activeClass);
      
      // Add transition class to main content if exists
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.classList.add('page-transition');
      }
      
      // Navigate after short delay
      setTimeout(() => {
        window.location.href = href;
      }, 200);
    }
  }

  // Initialize component
  function initNavbar() {
    if (isInitialized) return;
    
    // Get container
    navContainer = document.querySelector(`.${NAV_CONFIG.containerClass}`);
    if (!navContainer) {
      console.warn('Navbar container not found');
      return;
    }
    
    // Set active nav item
    setActiveNavItem();
    
    // Initialize scroll listener
    initScrollListener();
    
    // Add page show listener for bfcache
    window.addEventListener('pageshow', handlePageShow);
    
    // Add click listener for smooth navigation
    document.addEventListener('click', handleNavClick);
    
    isInitialized = true;
    
    // Add small delay to ensure DOM is ready for any animations
    setTimeout(() => {
      document.body.style.paddingBottom = '80px';
    }, 100);
  }

  // Dynamic loading function - called after navbar is injected
  window.initNavbar = initNavbar;

  // Auto-initialize if navbar already exists in DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }

})();
