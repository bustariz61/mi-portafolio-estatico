/**
 * Portafolio — Brayan Ustariz · app.js
 * Correcciones: fade-in, contador animado, formulario real, partículas, scroll-spy
 */

/* =============================================
   1. FADE-IN AL CARGAR (CORREGIDO)
   Body empieza invisible en CSS (.loaded lo muestra)
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
});

/* =============================================
   2. INICIALIZAR AOS
   ============================================= */
AOS.init({
    duration: 750,
    once: true,
    offset: 60,
    easing: 'ease-out-cubic'
});

/* =============================================
   3. DARK MODE con persistencia
   ============================================= */
const darkToggle = document.getElementById('darkModeToggle');
const darkIcon   = document.getElementById('darkIcon');
const body       = document.body;

function setDarkMode(isDark) {
    if (isDark) {
        body.classList.add('dark-mode');
        darkIcon?.classList.replace('fa-moon', 'fa-sun');
    } else {
        body.classList.remove('dark-mode');
        darkIcon?.classList.replace('fa-sun', 'fa-moon');
    }
    localStorage.setItem('darkMode', isDark);
}

// Cargar preferencia guardada o del sistema
const savedMode = localStorage.getItem('darkMode');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setDarkMode(savedMode !== null ? savedMode === 'true' : prefersDark);

darkToggle?.addEventListener('click', () => {
    setDarkMode(!body.classList.contains('dark-mode'));
});

/* =============================================
   4. PARTÍCULAS EN HERO
   ============================================= */
function createParticles() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;

    const count = window.innerWidth < 768 ? 12 : 22;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 6 + 3;
        const left = Math.random() * 100;
        const delay = Math.random() * 12;
        const duration = Math.random() * 10 + 12;
        p.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            opacity: ${Math.random() * 0.5 + 0.1};
        `;
        container.appendChild(p);
    }
}

createParticles();

/* =============================================
   5. CONTADORES ANIMADOS
   ============================================= */
function animateCounter(el) {
    const target  = parseInt(el.getAttribute('data-target'), 10);
    const suffix  = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const step    = 16;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            clearInterval(timer);
            el.textContent = target + suffix;
        } else {
            el.textContent = Math.floor(current) + suffix;
        }
    }, step);
}

const countersStarted = new Set();

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted.has(entry.target)) {
            countersStarted.add(entry.target);
            animateCounter(entry.target);
        }
    });
}, { threshold: 0.4 });

document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

/* =============================================
   6. SKILL BARS ANIMADAS
   ============================================= */
const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const fill = entry.target.querySelector('.skill-bar-fill');
            if (fill) {
                fill.style.width = fill.getAttribute('data-width') + '%';
            }
            barObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-bar-wrapper').forEach(el => barObserver.observe(el));

/* =============================================
   7. FORMULARIO — Validación para FormSubmit.co
   El form se envía nativamente (action en el HTML).
   Este bloque solo hace validación antes de submit.
   ============================================= */
function getGraciasUrl() {
    const currentUrl = new URL(window.location.href);
    const basePath = currentUrl.pathname.replace(/\/[^/]*$/, '/');
    return `${currentUrl.origin}${basePath}gracias`;
}

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        const nextInput = document.getElementById('formNextUrl');
        if (nextInput) {
            nextInput.value = getGraciasUrl();
        }

        const name    = document.getElementById('name')?.value.trim()    || '';
        const email   = document.getElementById('email')?.value.trim()   || '';
        const message = document.getElementById('message')?.value.trim() || '';

        // Validación básica antes de enviar
        if (!name || !email || !message) {
            e.preventDefault();
            alert('⚠️ Por favor completa todos los campos.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            e.preventDefault();
            alert('📧 Ingresa un email válido.');
            return;
        }

        if (message.length < 20) {
            e.preventDefault();
            alert('✍️ El mensaje debe tener al menos 20 caracteres.');
            return;
        }

        // Si pasa validación: muestra estado de carga y deja que el form se envíe
        const btn = document.getElementById('submitBtn');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            btn.disabled = true;
        }
        // El form se envía normalmente a FormSubmit.co → redirige a gracias.html
    });
}

/* =============================================
   8. SMOOTH SCROLL — Cerrar menú mobile
   ============================================= */
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId?.startsWith('#') && targetId !== '#') {
            e.preventDefault();
            const targetElem = document.querySelector(targetId);
            if (targetElem) {
                const navbarCollapse = document.getElementById('navbarNav');
                if (navbarCollapse?.classList.contains('show')) {
                    bootstrap.Collapse.getInstance(navbarCollapse)?.hide();
                }
                const offset = document.querySelector('.navbar')?.offsetHeight || 70;
                window.scrollTo({ top: targetElem.offsetTop - offset, behavior: 'smooth' });
            }
        }
    });
});

/* =============================================
   9. SCROLL SPY — Resalta enlace activo
   ============================================= */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

function updateActiveLink() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
        const top    = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id     = section.getAttribute('id');
        if (scrollY >= top && scrollY < bottom) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        }
    });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

/* =============================================
   10. NAVBAR SHADOW EN SCROLL
   ============================================= */
const navbar = document.querySelector('.glass-nav');
window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 40) {
        navbar.style.boxShadow = '0 6px 30px rgba(0,0,0,0.12)';
    } else {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)';
    }
}, { passive: true });

