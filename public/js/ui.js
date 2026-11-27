/**
 * UI: header state, scroll reveals and active navigation.
 * The mobile menu is a native <dialog>: focus containment, inert background,
 * Esc / back-gesture dismissal and focus return are all browser-managed.
 */
export function initUI() {
  const header = document.getElementById('site-header');
  const menu = document.getElementById('site-menu');
  const toggle = document.getElementById('menu-toggle');
  const close = document.getElementById('menu-close');

  // Header border appears once the page is scrolled.
  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Mobile menu. No role/aria-modal, no focus trap, no inert toggling and no Esc
  // handler: showModal() provides all of them and restores focus to the invoker.
  const openMenu = () => {
    if (!menu || !('showModal' in menu) || menu.open) return;
    menu.showModal();
    toggle?.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    if (menu && 'close' in menu && menu.open) menu.close();
  };

  toggle?.addEventListener('click', openMenu);
  close?.addEventListener('click', closeMenu);
  menu?.querySelectorAll('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // showModal() is script-driven, so the invoker's ARIA state is ours to keep.
  menu?.addEventListener('close', () => {
    toggle?.setAttribute('aria-expanded', 'false');
  });

  // A full-screen dialog leaves no backdrop to click: the close button and Esc
  // are the dismissal paths. Only guard against it surviving a desktop resize.
  const desktop = window.matchMedia('(min-width: 768px)');
  desktop.addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });

  // Reveal elements as they enter the viewport.
  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Highlight the section currently in view.
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${entry.target.id}`;
            link.toggleAttribute('data-active', isActive);
            if (isActive) {
              link.setAttribute('aria-current', 'true');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((section) => navObserver.observe(section));
  }
}
