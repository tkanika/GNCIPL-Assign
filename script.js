const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (nav) nav.classList.remove('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });
});


const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

const topBtn = document.querySelector('.to-top');
if (topBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      topBtn.style.display = 'inline-block';
    } else {
      topBtn.style.display = 'none';
    }
  });
  topBtn.style.display = window.scrollY > 300 ? 'inline-block' : 'none';
  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
