/* ═══════════ PILEGGI IMMOBILIARE — MAIN JS ═══════════ */

/* ═══════════ SMOOTH SCROLL INERZIALE (LENIS) ═══════════ */
/* Un solo "motore" di scroll per tutto il sito: se Lenis non si carica (CDN giù)
   o l'utente ha attivato la riduzione del movimento, si torna automaticamente
   allo scroll nativo senza rompere nulla. */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;

if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({
        duration: 1.15,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.8,
        infinite: false
    });
    const lenisRaf = time => { lenis.raf(time); requestAnimationFrame(lenisRaf); };
    requestAnimationFrame(lenisRaf);
}

/* Blocca/sblocca lo scroll (loader, menu mobile) parlando sia a Lenis sia al body */
function lockScroll(locked) {
    if (lenis) locked ? lenis.stop() : lenis.start();
    document.body.style.overflow = locked ? 'hidden' : '';
}

/* ═══════════ LOADER ═══════════ */
const loader = document.getElementById('loader');
if (loader) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
            animateHero();
        }, 2800);
    });
}

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

/* ═══════════ SCROLL: NAVBAR + PARALLAX HERO ═══════════ */
/* Un unico handler throttlato su requestAnimationFrame: con Lenis lo scroll
   cambia a ogni frame, quindi due listener separati raddoppierebbero il lavoro. */
const nav = document.getElementById('nav');
const heroVideo = document.querySelector('#home video');
let scrollTicking = false;

function onScroll() {
    const y = window.scrollY;

    if (nav) nav.classList.toggle('nav-scrolled', y > 80);

    if (heroVideo && y < window.innerHeight) {
        heroVideo.style.transform =
            `scale(${1 + y * 0.0003}) translateY(${y * 0.3}px)`;
    }

    scrollTicking = false;
}

window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(onScroll);
}, { passive: true });
onScroll();

/* ═══════════ HAMBURGER ═══════════ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('hamburger-active');
        const isOpen = mobileMenu.classList.toggle('!opacity-100');
        mobileMenu.classList.toggle('!visible');
        lockScroll(isOpen);
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            hamburger.classList.remove('hamburger-active');
            mobileMenu.classList.remove('!opacity-100', '!visible');
            lockScroll(false);
        });
    });
}

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

    /* Lenis intercetta la rotella per tutta la pagina: qui reintroduciamo lo
       swipe orizzontale da trackpad sulla galleria (il verticale resta alla pagina). */
    gallery.addEventListener('wheel', e => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            gallery.scrollLeft += e.deltaX;
        }
    }, { passive: true });
}

/* ═══════════ ANCORE (salto alle sezioni) ═══════════ */
const NAV_OFFSET = 80; /* altezza navbar fissa in stato "scrolled" */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const hash = this.getAttribute('href');
        if (hash === '#' || hash.length < 2) return;
        const target = document.querySelector(hash);
        if (!target) return;

        e.preventDefault();
        if (lenis) {
            lenis.scrollTo(target, { offset: -NAV_OFFSET, duration: 1.4 });
        } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
