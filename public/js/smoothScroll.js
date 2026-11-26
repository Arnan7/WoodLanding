export function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');

  // Helper: get current sticky header height (if any)
  function getHeaderOffset() {
    // Look for the first visible element that is 'position: sticky' or has top: 0 and z-index
    const nav = document.querySelector('nav');
    if (!nav) return 0;
    const style = window.getComputedStyle(nav);
    // If nav is fixed/sticky, use its height; otherwise 0
    if (style.position === 'sticky' || style.position === 'fixed' || nav.classList.contains('sticky')) {
      return nav.getBoundingClientRect().height;
    }
    // Fallback: if it's visually at top and has z-index, assume it's covering
    if (nav.offsetTop === 0 && parseInt(style.zIndex || '0', 10) > 0) {
      return nav.getBoundingClientRect().height;
    }
    return 0;
  }

  anchors.forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (!href) return;

      // If it's just '#' allow default
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // Special-case: when clicking Inicio (#inicio) on mobile menu we want to scroll near very top
      // We'll still offset by header to ensure header doesn't cover content. For inicio, if target is the page header
      // we allow a small top offset (5px) so the very top is visible.
      const headerOffset = getHeaderOffset();

      const targetY = window.scrollY + target.getBoundingClientRect().top - headerOffset - 4; // small extra gap [4 - 6]

      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    });
  });
}


