export function initAOSAndSwiper() {
  if (typeof window === 'undefined') return;
  if (window.AOS) {
    try { window.AOS.init({ duration: 700, once: true }); } catch (e) { console.warn('AOS init failed', e); }
  }
  // initialize Swiper if available
  try {
    if (window.Swiper) {
      new window.Swiper('.swiper-container', {
        loop: true,
        slidesPerView: 1,
        autoplay: { delay: 3500 },
        pagination: { el: '.swiper-pagination', clickable: true },
      });
    }
  } catch (e) { console.warn('Swiper init failed', e); }

  
}


