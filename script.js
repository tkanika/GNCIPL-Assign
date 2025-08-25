// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile menu after click
      nav?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

// IntersectionObserver reveal
const observer = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }),
  { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Scroll to top button
const topBtn = document.querySelector('.to-top');
if (topBtn) {
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// Dynamic year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Active link highlighting on scroll
const sections = [...document.querySelectorAll('main section[id]')];
const links = [...document.querySelectorAll('.site-nav ul a')];

function setActiveLink() {
  const scrollPos = window.scrollY + 120; // header offset
  let currentId = sections[0]?.id;
  for (const sec of sections) {
    if (sec.offsetTop <= scrollPos) currentId = sec.id;
  }
  links.forEach(link => {
    const isActive = link.getAttribute('href') === `#${currentId}`;
    link.style.opacity = isActive ? '1' : '';
    link.style.textDecoration = isActive ? 'underline' : '';
  });
}
setActiveLink();
window.addEventListener('scroll', setActiveLink);

// Optional: copy email/phone on double-click (tiny UX sugar)
function copyOnDblClick(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.addEventListener('dblclick', async () => {
    try {
      await navigator.clipboard.writeText(value);
      el.classList.add('copied');
      setTimeout(() => el.classList.remove('copied'), 800);
    } catch (_) {}
  });
}
copyOnDblClick('.quick-info li:nth-child(2)', '+918958084201');
copyOnDblClick('.quick-info li:nth-child(3)', 'kanikatomer28@gmail.com');
