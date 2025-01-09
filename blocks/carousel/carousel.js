function setActiveSlide(slide) {
    // Finds the parent carousel and updates its active slide index
    const carousel = slide.closest('.carousel');
    const newIndex = Number(slide.dataset.slideIndex);
    carousel.dataset.activeSlide = newIndex;

    // Updates aria-hidden and tabindex attributes for accessibility
    carousel.querySelectorAll('.carousel-slide').forEach((currentSlide, index) => {
        const isActive = index === newIndex;
        currentSlide.setAttribute('aria-hidden', !isActive);
        currentSlide.querySelectorAll('a').forEach((link) => {
            link.setAttribute('tabindex', isActive ? '0' : '-1');
        });
    });
}

function scrollToSlide(carousel, index) {
    // Handles smooth scrolling to the target slide based on index
    const slides = carousel.querySelectorAll('.carousel-slide');
    const targetIndex = (index + slides.length) % slides.length; // Wraps index if out of bounds
    const targetSlide = slides[targetIndex];

    carousel.querySelector('.carousel-slides').scrollTo({
        left: targetSlide.offsetLeft,
        behavior: 'smooth',
    });
}

function attachCarouselEvents(carousel) {
    // Helper to get the current active slide index
    const getActiveIndex = () => Number(carousel.dataset.activeSlide);

    // Attaches click events for navigation buttons
    carousel.querySelector('.slide-prev')?.addEventListener('click', () => {
        scrollToSlide(carousel, getActiveIndex() - 1);
    });

    carousel.querySelector('.slide-next')?.addEventListener('click', () => {
        scrollToSlide(carousel, getActiveIndex() + 1);
    });
}

function buildSlide(row, index, carouselId) {
    // Builds a single slide element with appropriate classes and attributes
    const slide = document.createElement('li');
    slide.className = 'carousel-slide';
    slide.dataset.slideIndex = index;
    slide.id = `carousel-${carouselId}-slide-${index}`;

    // Processes columns in the row and assigns classes based on their position
    row.querySelectorAll(':scope > div').forEach((column, colIndex) => {
        column.className = `carousel-slide-${colIndex === 0 ? 'image' : 'content'}`;
        slide.append(column);
    });

    // Adds an aria-labelledby attribute if the slide contains a heading
    const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) slide.setAttribute('aria-labelledby', heading.id);

    return slide;
}

let carouselCounter = 0;

export default function initializeCarousel(block) {
    // Sets a unique ID for each carousel and prepares its structure
    const carouselId = ++carouselCounter;
    block.id = `carousel-${carouselId}`;
    const rows = Array.from(block.children);
    const multipleSlides = rows.length > 1;

    // Adds ARIA attributes for accessibility
    block.setAttribute('role', 'region');
    block.setAttribute('aria-roledescription', 'Carousel');

    // Creates a container for the slides
    const slidesList = document.createElement('ul');
    slidesList.className = 'carousel-slides';

    // Builds and appends slides
    rows.forEach((row, index) => {
        const slide = buildSlide(row, index, carouselId);
        slidesList.append(slide);
    });

    block.innerHTML = ''; // Clears existing content
    block.append(slidesList); // Adds slides to the carousel

    if (multipleSlides) {
        attachCarouselEvents(block); // Adds navigation and observer functionality
    }
}
