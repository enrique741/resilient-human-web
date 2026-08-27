document.addEventListener('DOMContentLoaded', () => {

    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // Navbar shadow + scroll-spy + sticky action bar, coalesced into one rAF-throttled pass
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const actionBar = document.getElementById('mobileActionBar');
    const heroSection = document.getElementById('hero');
    let scrollTicking = false;
    function onScrollFrame() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        if (actionBar && heroSection) {
            const show = window.scrollY > heroSection.offsetHeight - 80;
            if (show !== actionBar.classList.contains('visible')) {
                actionBar.classList.toggle('visible', show);
                actionBar.setAttribute('aria-hidden', String(!show));
            }
        }
        const scrollY = window.scrollY + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-links a[href="#${id}"]`);
            if (link) {
                link.classList.toggle('active-link', scrollY >= top && scrollY < top + height);
            }
        });
        scrollTicking = false;
    }
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(onScrollFrame);
        }
    }, { passive: true });
    onScrollFrame();

    // Mobile menu toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Scroll animations
    const fadeElements = document.querySelectorAll(
        '.servicio-card, .step, .contacto-card, .sobre-text, .sobre-visual, .insta-card, .quees-text, .quees-img, .instal-photo, .colab-card'
    );

    fadeElements.forEach(el => el.classList.add('fade-in'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeElements.forEach(el => observer.observe(el));

    // Smooth scroll for anchor links (respects reduced motion)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: reduceMotionQuery.matches ? 'auto' : 'smooth' });
            }
        });
    });

    // Prefilled WhatsApp message (mobile only; desktop links stay as-is)
    if (isMobile) {
        document.querySelectorAll('a[href*="wa.me/34628999116"]').forEach(link => {
            const url = new URL(link.href);
            if (!url.searchParams.has('text')) {
                url.searchParams.set('text', 'Hola, quiero pedir cita en Resilient Human');
                link.href = url.toString();
            }
        });
    }

    // Hero video: data saving, battery, and pause control
    const heroVideo = document.querySelector('.hero-bg-video');
    const videoToggle = document.getElementById('videoToggle');
    if (heroVideo) {
        const saveData = !!(navigator.connection && navigator.connection.saveData);

        if (reduceMotionQuery.matches || (saveData && isMobile)) {
            heroVideo.removeAttribute('autoplay');
            heroVideo.pause();
            heroVideo.querySelectorAll('source').forEach(s => s.remove());
            heroVideo.load();
            if (videoToggle) videoToggle.hidden = true;
        } else {
            let heroVisible = true;
            let userPaused = false;
            const syncPlayback = () => {
                if (heroVisible && !document.hidden && !userPaused) {
                    heroVideo.play().catch(() => {});
                } else {
                    heroVideo.pause();
                }
            };
            const videoObserver = new IntersectionObserver(([entry]) => {
                heroVisible = entry.isIntersecting;
                syncPlayback();
            }, { threshold: 0.1 });
            videoObserver.observe(heroVideo);
            document.addEventListener('visibilitychange', syncPlayback);

            if (videoToggle) {
                videoToggle.addEventListener('click', () => {
                    userPaused = !heroVideo.paused;
                    syncPlayback();
                    videoToggle.querySelector('.icon-pause').style.display = userPaused ? 'none' : '';
                    videoToggle.querySelector('.icon-play').style.display = userPaused ? '' : 'none';
                    videoToggle.setAttribute('aria-label', userPaused ? 'Reproducir vídeo de fondo' : 'Pausar vídeo de fondo');
                });
            }
        }
    }
});
