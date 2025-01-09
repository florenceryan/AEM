function updateSlideVisibility(carousel, activeIndex) {
    const slides = carousel.querySelectorAll('.carousel-slide');
    slides.forEach((slide, idx) => {
      slide.setAttribute('aria-hidden', idx !== activeIndex);
      slide.querySelectorAll('a').forEach(link => {
        link.setAttribute('tabindex', idx === activeIndex ? '' : '-1');
      });
    });
  
    carousel.querySelector('.carousel-navigation-buttons .carousel-slide-number').textContent = activeIndex + 1;
  }
  
  function toggleAutoplay(carousel, autoplayInterval) {
    const isPlaying = autoplayInterval !== null;
    const pauseButton = carousel.querySelector('.slide-pause');
    pauseButton.textContent = isPlaying ? '>' : '||';
  
    if (isPlaying) {
      clearInterval(autoplayInterval);
      return null;
    } else {
      const interval = setInterval(() => {
        showSlide(carousel, (parseInt(carousel.dataset.activeSlide, 10) + 1) % carousel.querySelectorAll('.carousel-slide').length);
      }, 8000);
      return interval;
    }
  }
  
  function setUpEventListeners(carousel, autoplayInterval) {
    carousel.querySelector('.slide-pause').addEventListener('click', () => {
      autoplayInterval = toggleAutoplay(carousel, autoplayInterval);
    });
  
    carousel.querySelector('.slide-prev').addEventListener('click', () => {
      showSlide(carousel, (parseInt(carousel.dataset.activeSlide, 10) - 1 + carousel.querySelectorAll('.carousel-slide').length) % carousel.querySelectorAll('.carousel-slide').length);
    });
  
    carousel.querySelector('.slide-next').addEventListener('click', () => {
      showSlide(carousel, (parseInt(carousel.dataset.activeSlide, 10) + 1) % carousel.querySelectorAll('.carousel-slide').length);
    });
  
    const slideObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateSlideVisibility(carousel, parseInt(entry.target.dataset.slideIndex, 10));
        }
      });
    }, { threshold: 0.5 });
  
    carousel.querySelectorAll('.carousel-slide').forEach(slide => {
      slideObserver.observe(slide);
    });
  }
  
  function createCarouselControls(slidesLength) {
    const controls = document.createElement('div');
    controls.className = 'carousel-navigation-buttons';
  
    controls.innerHTML = `
      <button type="button" class="slide-pause" aria-label="Pause Slide">||</button>
      <button type="button" class="slide-prev" aria-label="Previous Slide"></button>
      <span><span class="carousel-slide-number">1</span> / ${slidesLength}</span>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;
  
    return controls;
  }
  
  function createCarouselSlides(slides) {
    const slidesList = document.createElement('ul');
    slidesList.classList.add('carousel-slides');
  
    slides.forEach((slide, index) => {
      const listItem = document.createElement('li');
      listItem.classList.add('carousel-slide');
      listItem.dataset.slideIndex = index;
      listItem.append(slide.firstElementChild);
      slidesList.append(listItem);
    });
  
    return slidesList;
  }
  
  function showSlide(carousel, slideIndex) {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const normalizedIndex = (slideIndex + slides.length) % slides.length;
  
    carousel.dataset.activeSlide = normalizedIndex;
    updateSlideVisibility(carousel, normalizedIndex);
  
    carousel.querySelector('.carousel-slides').scrollTo({
      top: 0,
      left: slides[normalizedIndex].offsetLeft,
      behavior: 'smooth'
    });
  }
  
  function createHeroBannerSection(block, featured) {
    const bannerContainer = document.createElement('div');
    bannerContainer.classList.add('hero-banner-cards');
  
    featured.forEach(feature => {
      feature.classList.add('hero-banner-card');
      bannerContainer.append(feature);
    });
  
    block.append(bannerContainer);
  }
  
  async function buildCarousel(block, slides) {
    const slidesLength = slides.length;
  
    const container = document.createElement('div');
    const slidesList = createCarouselSlides(slides);
    const controls = createCarouselControls(slidesLength);
  
    container.classList.add('carousel-slides-container');
    container.append(slidesList, controls);
    block.append(container);
  
    block.classList.add('carousel');
    block.setAttribute('role', 'region');
    block.setAttribute('aria-roledescription', 'Carousel');
  
    block.dataset.activeSlide = 0;
    showSlide(block, 0);
  
    let autoplayInterval = null;
    setUpEventListeners(block, autoplayInterval);
  }
  
  export default async function decorate(block) {
    const slides = block.querySelectorAll(':scope > div div:first-child');
    const featured = block.querySelectorAll(':scope > div div + div');
  
    block.textContent = ''; // Clear block content
  
    await buildCarousel(block, slides);
    createHeroBannerSection(block, featured);
  }
  