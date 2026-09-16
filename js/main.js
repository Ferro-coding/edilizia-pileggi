/* ═══════════ PILEGGI IMMOBILIARE — MAIN JS ═══════════ */

/* ═══════════ LOADER ═══════════ */
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        animateHero();
    }, 2800);
});

/* ═══════════ CUSTOM CURSOR ═══════════ */
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
    dot.style.transform = 'translate(-50%, -50%)';
});

function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, .gallery-item').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
});

/* ═══════════ HERO ANIMATION ═══════════ */
function animateHero() {
    const words = document.querySelectorAll('.hero-title .word');
    words.forEach((word, i) => {
        setTimeout(() => {
            word.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            word.style.opacity = '1';
            word.style.transform = 'translateY(0) rotateX(0)';
        }, i * 200);
    });

    setTimeout(() => {
        const line = document.querySelector('.hero-line');
        if (line) {
            line.style.transition = 'width 1.5s ease';
            line.style.width = '120px';
        }
    }, 800);

    const tag = document.querySelector('.hero-tag');
    if (tag) {
        setTimeout(() => {
            tag.style.transition = 'all 1s ease';
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
        }, 300);
    }

    const sub = document.querySelector('.hero-sub');
    if (sub) {
        setTimeout(() => {
            sub.style.transition = 'all 1s ease';
            sub.style.opacity = '1';
            sub.style.transform = 'translateY(0)';
        }, 1200);
    }

}

/* ═══════════ SCROLL REVEAL ═══════════ */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

/* ═══════════ COUNTER ANIMATION ═══════════ */
const counters = document.querySelectorAll('[data-target]');
let countersAnimated = false;
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
            countersAnimated = true;
            counters.forEach(counter => {
                const target = +counter.dataset.target;
                const duration = 2000;
                const start = performance.now();
                const label = counter.nextElementSibling ? counter.nextElementSibling.textContent : '';
                const suffix = label.includes('%') ? '%' : '+';

                function updateCounter(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    counter.textContent = Math.floor(eased * target) + suffix;
                    if (progress < 1) requestAnimationFrame(updateCounter);
                }
                requestAnimationFrame(updateCounter);
            });
        }
    });
}, { threshold: 0.3 });
counters.forEach(c => counterObserver.observe(c));

/* ═══════════ NAV SCROLL ═══════════ */
window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (window.scrollY > 80) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
});

/* ═══════════ HAMBURGER ═══════════ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('hamburger-active');
    const isOpen = mobileMenu.classList.toggle('!opacity-100');
    mobileMenu.classList.toggle('!visible');
    document.body.style.overflow = isOpen ? 'hidden' : '';
});
mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        hamburger.classList.remove('hamburger-active');
        mobileMenu.classList.remove('!opacity-100', '!visible');
        document.body.style.overflow = '';
    });
});

/* ═══════════ GALLERY DRAG SCROLL ═══════════ */
const gallery = document.getElementById('galleryScroll');
if (gallery) {
    let isDragging = false, startX, scrollLeft;
    gallery.addEventListener('mousedown', e => {
        isDragging = true;
        gallery.classList.add('dragging');
        startX = e.pageX - gallery.offsetLeft;
        scrollLeft = gallery.scrollLeft;
    });
    gallery.addEventListener('mouseleave', () => { isDragging = false; gallery.classList.remove('dragging'); });
    gallery.addEventListener('mouseup', () => { isDragging = false; gallery.classList.remove('dragging'); });
    gallery.addEventListener('mousemove', e => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - gallery.offsetLeft;
        gallery.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
}

/* ═══════════ SMOOTH SCROLL ═══════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* ═══════════ PARALLAX HERO ═══════════ */
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero video');
    if (hero && window.scrollY < window.innerHeight) {
        hero.style.transform = `scale(${1 + window.scrollY * 0.0003}) translateY(${window.scrollY * 0.3}px)`;
    }
});
