document.addEventListener('DOMContentLoaded', function () {
      // Mobile Menu Toggle
      const mobileToggle = document.querySelector('.mobile-toggle');
      const nav = document.querySelector('nav');

      // Intro animation
      const introOverlay = document.querySelector('.intro-overlay');
      if (introOverlay) {
        setTimeout(() => {
          introOverlay.classList.add('hide');
          setTimeout(() => {
            introOverlay.remove();
          }, 500);
        }, 800);
      }

      if (mobileToggle) {
        mobileToggle.addEventListener('click', function (e) {
          e.stopPropagation();
          nav.classList.toggle('active');

          const icon = this.querySelector('i');
          if (nav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
          } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          }
        });

        document.addEventListener('click', function (e) {
          if (!nav.contains(e.target) && e.target !== mobileToggle && nav.classList.contains('active')) {
            nav.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          }
        });

        document.querySelectorAll('nav a').forEach(link => {
          link.addEventListener('click', function () {
            if (nav.classList.contains('active')) {
              nav.classList.remove('active');
              const icon = mobileToggle.querySelector('i');
              icon.classList.remove('fa-times');
              icon.classList.add('fa-bars');
            }
          });
        });
      }

      // PROJECT FILTER FUNCTIONALITY
      const categoryFilter = document.getElementById('categoryFilter');
      const resetFilter = document.getElementById('resetFilter');
      const projectItems = document.querySelectorAll('.project-item');

      // Filter projects based on selected category
      function filterProjects() {
        const selectedCategory = categoryFilter.value;

        projectItems.forEach(item => {
          const categories = item.getAttribute('data-categories').split(',');

          if (selectedCategory === 'all' || categories.includes(selectedCategory)) {
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = 1;
              item.style.transform = 'translateY(0)';
            }, 10);
          } else {
            item.style.opacity = 0;
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
      }

      // Initialize filter functionality
      if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProjects);
      }

      if (resetFilter) {
        resetFilter.addEventListener('click', function () {
          categoryFilter.value = 'all';
          filterProjects();
        });
      }

      // Animate project items on scroll
      const animateOnScroll = () => {
        const elements = document.querySelectorAll('.project-item');

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = 1;
              entry.target.style.transform = 'translateY(0)';
            }
          });
        }, { threshold: 0.1 });

        elements.forEach(element => {
          element.style.opacity = 0;
          element.style.transform = 'translateY(20px)';
          element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          observer.observe(element);
        });
      };

      // Glow effect enhancement
      const enhanceGlowEffects = () => {
        const glowElements = document.querySelectorAll('.glow');

        glowElements.forEach(element => {
          element.addEventListener('mouseenter', () => {
            element.classList.add('active');
          });

          element.addEventListener('mouseleave', () => {
            element.classList.remove('active');
          });
        });
      };

      // Smooth scrolling for anchor links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });

      animateOnScroll();
      enhanceGlowEffects();

      /* ---------- Cookie Consent ---------- */
      function initCookies() {
        const cookieConsent = document.getElementById('cookieConsent');
        const cookiesAccepted = localStorage.getItem('cookiesAccepted');
        if (cookiesAccepted) {
          cookieConsent.classList.add('hidden');
        }
      }
      window.acceptCookies = function () {
        localStorage.setItem('cookiesAccepted', 'true');
        document.getElementById('cookieConsent').classList.add('hidden');
      }
      window.rejectCookies = function () {
        localStorage.setItem('cookiesAccepted', 'false');
        document.getElementById('cookieConsent').classList.add('hidden');
      }
      initCookies();
    });
