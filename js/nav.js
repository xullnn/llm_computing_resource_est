// Navigation Logic
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.textContent = isOpen ? '✕' : '☰';
    });
  }

  // Highlight active link if not already set manually
  const currentPath = window.location.pathname;
  if (!document.querySelector('.nav-item.active')) {
    document.querySelectorAll('.nav-item').forEach(link => {
      // Simple check: if href matches the start of the current path
      // Note: This is heuristic and might need adjustment
      const href = link.getAttribute('href');
      // Normalize paths for comparison (remove ../, etc)
      if (href === '/' && (currentPath === '/' || currentPath === '/index.html')) {
        link.classList.add('active');
      } else if (href.includes('models/') && currentPath.includes('models/')) {
        link.classList.add('active');
      } else if (href.includes('quickstart.html') && currentPath.includes('quickstart.html')) {
        link.classList.add('active');
      } else if (href.includes('hardware/') && currentPath.includes('hardware/')) {
        link.classList.add('active');
      }
    });
  }
});

