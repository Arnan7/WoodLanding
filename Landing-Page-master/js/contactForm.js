export function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    const original = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'Enviando...';
    setTimeout(() => {
      btn.disabled = false;
      btn.innerText = original;
      alert('Gracias — hemos recibido tu solicitud. Te contactaremos pronto.');
      form.reset();
    }, 900);
  });
}


