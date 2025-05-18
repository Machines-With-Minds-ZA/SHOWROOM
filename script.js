
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add scroll event listener for header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            
            // Change navigation text color
            const navLinks = document.querySelectorAll('nav ul li a');
            navLinks.forEach(link => {
                link.style.color = '#333';
            });
            
            // Change logo color
            const logo = document.querySelector('.logo');
            logo.style.color = '#333';
        } else {
            header.style.background = 'transparent';
            header.style.boxShadow = 'none';
            
            // Reset navigation text color
            const navLinks = document.querySelectorAll('nav ul li a');
            navLinks.forEach(link => {
                link.style.color = '#fff';
            });
            
            // Reset logo color
            const logo = document.querySelector('.logo');
            logo.style.color = '#fff';
        }
    });
    
    // Add enhanced glow effect to project cards
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(76, 175, 80, 0.2)';
            
            // Create glow effect for the icon
            const icon = this.querySelector('.project-icon');
            icon.style.transform = 'scale(1.1)';
            icon.style.transition = 'transform 0.3s ease';
            icon.style.color = '#4CAF50';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            
            // Reset icon
            const icon = this.querySelector('.project-icon');
            icon.style.transform = 'scale(1)';
            icon.style.color = '#2196F3';
        });
    });
    
    // Video button click effect
    const videoBtn = document.querySelector('.video-btn');
    if (videoBtn) {
        videoBtn.addEventListener('click', function() {
            alert('Video player would open here in production');
        });
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
});
