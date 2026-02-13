// Main JavaScript file for website functionality

document.addEventListener('DOMContentLoaded', function() {
    // Age Verification Logic
    const ageGateOverlay = document.getElementById('ageGateOverlay');
    const ageGateBtn = document.getElementById('ageGateBtn');
    
    // Check if user has already verified age
    const isAgeVerified = localStorage.getItem('ageVerified');
    
    if (!isAgeVerified && ageGateOverlay) {
        // Show popup
        setTimeout(() => {
            ageGateOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }, 500);
    }

    if (ageGateBtn) {
        ageGateBtn.addEventListener('click', function() {
            localStorage.setItem('ageVerified', 'true');
            ageGateOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });
    }

    // Hero Slider
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 0) {
        let currentHeroSlide = 0;
        const heroSlideCount = heroSlides.length;

        function showHeroSlide(index) {
            heroSlides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });
        }

        function nextHeroSlide() {
            currentHeroSlide = (currentHeroSlide + 1) % heroSlideCount;
            showHeroSlide(currentHeroSlide);
        }

        function prevHeroSlide() {
            currentHeroSlide = (currentHeroSlide - 1 + heroSlideCount) % heroSlideCount;
            showHeroSlide(currentHeroSlide);
        }

        // Auto-advance every 10 seconds
        setInterval(nextHeroSlide, 10000);

        // Manual controls
        const prevSlideBtn = document.getElementById('prevSlide');
        const nextSlideBtn = document.getElementById('nextSlide');
        
        if (prevSlideBtn) {
            prevSlideBtn.addEventListener('click', prevHeroSlide);
        }
        if (nextSlideBtn) {
            nextSlideBtn.addEventListener('click', nextHeroSlide);
        }
    }

    // Gallery Slider (if present)
    const galleryTrack = document.querySelector('.gallery-track');
    const gallerySlides = document.querySelectorAll('.gallery-slide');
    if (galleryTrack && gallerySlides.length > 0) {
        let currentGallerySlide = 0;
        const gallerySlideCount = gallerySlides.length;

        function updateGalleryPosition() {
            const offset = -currentGallerySlide * 100;
            galleryTrack.style.transform = `translateX(${offset}%)`;
        }

        function nextGallerySlide() {
            currentGallerySlide = (currentGallerySlide + 1) % gallerySlideCount;
            updateGalleryPosition();
        }

        function prevGallerySlide() {
            currentGallerySlide = (currentGallerySlide - 1 + gallerySlideCount) % gallerySlideCount;
            updateGalleryPosition();
        }

        const prevGalleryBtn = document.getElementById('prevGallery');
        const nextGalleryBtn = document.getElementById('nextGallery');
        
        if (prevGalleryBtn) {
            prevGalleryBtn.addEventListener('click', prevGallerySlide);
        }
        if (nextGalleryBtn) {
            nextGalleryBtn.addEventListener('click', nextGallerySlide);
        }
    }

    // Testimonial Slider (if present)
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    if (testimonialSlides.length > 0) {
        let currentTestimonial = 0;
        const testimonialCount = testimonialSlides.length;

        function showTestimonial(index) {
            testimonialSlides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });
        }

        function nextTestimonial() {
            currentTestimonial = (currentTestimonial + 1) % testimonialCount;
            showTestimonial(currentTestimonial);
        }

        function prevTestimonial() {
            currentTestimonial = (currentTestimonial - 1 + testimonialCount) % testimonialCount;
            showTestimonial(currentTestimonial);
        }

        // Auto-advance every 8 seconds
        setInterval(nextTestimonial, 8000);

        const prevTestimonialBtn = document.getElementById('prevTestimonial');
        const nextTestimonialBtn = document.getElementById('nextTestimonial');
        
        if (prevTestimonialBtn) {
            prevTestimonialBtn.addEventListener('click', prevTestimonial);
        }
        if (nextTestimonialBtn) {
            nextTestimonialBtn.addEventListener('click', nextTestimonial);
        }
    }

    // Dynamic Copyright Year
    function updateCopyrightYear() {
        const yearSpans = document.querySelectorAll('.js-copyright-year');
        const currentYear = new Date().getFullYear();
        yearSpans.forEach(span => {
            span.textContent = currentYear;
        });
    }
    
    updateCopyrightYear();
});
