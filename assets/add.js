a/**
 * Look Gallery Custom Element
 * Handles look gallery navigation and interactions
 */
class LookGallery extends HTMLElement {
  constructor() {
    super();
    this.currentIndex = 0;
    this.slides = [];
    this.thumbnails = [];
    this.maxIndex = 0;
    
    this.init();
  }

  init() {
    // Get elements
    this.slidesContainer = this.querySelector('.look-gallery__slides');
    this.thumbnailsContainer = this.querySelector('.look-gallery__thumbnails-list');
    this.prevButton = this.querySelector('[data-action="prev"]');
    this.nextButton = this.querySelector('[data-action="next"]');
    
    // Get slides and thumbnails
    this.slides = Array.from(this.querySelectorAll('.look-gallery__slide'));
    this.thumbnails = Array.from(this.querySelectorAll('.look-gallery__thumbnail'));
    this.maxIndex = this.slides.length - 1;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update navigation state
    this.updateNavigation();
    
    // Set up Shopify editor support
    if (Shopify && Shopify.designMode) {
      this.setupDesignMode();
    }
  }

  setupEventListeners() {
    // Navigation buttons
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.goToPrevious());
    }
    
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.goToNext());
    }
    
    // Thumbnail clicks
    this.thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Keyboard navigation
    this.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.goToNext();
          break;
      }
    });
    
    // Touch/swipe support for mobile
    this.setupTouchEvents();
  }

  setupTouchEvents() {
    let startX = 0;
    let endX = 0;
    
    this.slidesContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    
    this.slidesContainer.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      this.handleSwipe(startX, endX);
    }, { passive: true });
  }

  handleSwipe(startX, endX) {
    const threshold = 50; // Minimum distance for swipe
    const diff = startX - endX;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left - go to next
        this.goToNext();
      } else {
        // Swipe right - go to previous
        this.goToPrevious();
      }
    }
  }

  goToSlide(index) {
    if (index < 0 || index > this.maxIndex || index === this.currentIndex) {
      return;
    }
    
    // Hide current slide
    this.slides[this.currentIndex]?.classList.remove('is-active');
    this.thumbnails[this.currentIndex]?.classList.remove('is-active');
    
    // Show new slide
    this.currentIndex = index;
    this.slides[this.currentIndex]?.classList.add('is-active');
    this.thumbnails[this.currentIndex]?.classList.add('is-active');
    
    // Update navigation
    this.updateNavigation();
    
    // Scroll thumbnail into view
    this.scrollThumbnailIntoView(index);
    
    // Trigger custom event
    this.dispatchEvent(new CustomEvent('look:change', {
      detail: { index: this.currentIndex }
    }));
  }

  goToPrevious() {
    const newIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.maxIndex;
    this.goToSlide(newIndex);
  }

  goToNext() {
    const newIndex = this.currentIndex < this.maxIndex ? this.currentIndex + 1 : 0;
    this.goToSlide(newIndex);
  }

  updateNavigation() {
    // Update button states
    if (this.prevButton) {
      this.prevButton.disabled = this.slides.length <= 1;
    }
    
    if (this.nextButton) {
      this.nextButton.disabled = this.slides.length <= 1;
    }
  }

  scrollThumbnailIntoView(index) {
    const thumbnail = this.thumbnails[index];
    if (!thumbnail) return;
    
    const container = this.thumbnailsContainer.parentElement;
    if (!container) return;
    
    // Calculate scroll position to center the thumbnail
    const thumbnailRect = thumbnail.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    
    const thumbnailCenter = thumbnailRect.left - containerRect.left + scrollLeft + (thumbnailRect.width / 2);
    const containerCenter = container.clientWidth / 2;
    const targetScrollLeft = thumbnailCenter - containerCenter;
    
    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'smooth'
    });
  }

  setupDesignMode() {
    // Handle block selection in Shopify editor
    document.addEventListener('shopify:block:select', (event) => {
      if (this.contains(event.target)) {
        const blockElement = event.target.closest('.look-gallery__slide');
        if (blockElement) {
          const index = parseInt(blockElement.dataset.lookIndex);
          if (!isNaN(index)) {
            this.goToSlide(index);
          }
        }
      }
    });
  }

  // Public API methods
  getCurrentIndex() {
    return this.currentIndex;
  }

  getTotalSlides() {
    return this.slides.length;
  }

  // Refresh method for dynamic content updates
  refresh() {
    this.slides = Array.from(this.querySelectorAll('.look-gallery__slide'));
    this.thumbnails = Array.from(this.querySelectorAll('.look-gallery__thumbnail'));
    this.maxIndex = this.slides.length - 1;
    
    // Reset to first slide if current index is out of bounds
    if (this.currentIndex > this.maxIndex) {
      this.currentIndex = 0;
    }
    
    this.updateNavigation();
  }
}

// Register the custom element
if (!customElements.get('look-gallery')) {
  customElements.define('look-gallery', LookGallery);
}

export default LookGallery;