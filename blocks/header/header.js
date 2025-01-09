import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach(section => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach(drop => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach(drop => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  block.textContent = '';
  const nav = document.createElement('nav');
  const navClasses = ['brand', 'sections', 'tools'];
  const topbarWrapper = document.createElement('div');
  topbarWrapper.className = 'section nav-topbar';
  nav.id = 'nav';

  if (fragment.firstElementChild.classList.contains('topbar')) topbarWrapper.append(fragment.firstElementChild);

  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  navClasses.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');

  if (navBrand) {
    const link = navBrand.querySelector('a');
    const picture = navBrand.querySelector('picture');
    const img = navBrand.querySelector('img');
    picture.remove();
    link.append(img);
  }

  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach(navSection => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop', 'arrow');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);

  block.append(topbarWrapper, navWrapper);

  finalizeNav()
}

function finalizeNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const navSections = document.querySelector('.nav-sections');
  const navTools = document.querySelector('.nav-tools');

  // Combine nav sections and tools if both exist
  if (navSections && navTools) {
    const combinedSection = document.createElement('div');
    combinedSection.className = 'section combined-nav';
    combinedSection.dataset.sectionStatus = 'loaded';

    const navSectionsContent = navSections.querySelector('.default-content-wrapper');
    const navToolsContent = navTools.querySelector('.default-content-wrapper');

    if (navSectionsContent) combinedSection.appendChild(navSectionsContent);
    if (navToolsContent) combinedSection.appendChild(navToolsContent);

    nav.appendChild(combinedSection);
    navSections.remove();
    navTools.remove();
  }

  // Process nav structure
  const navWrapper = document.querySelector('.nav-wrapper');
  if (navWrapper) {
    const combinedNav = nav.querySelector('.combined-nav');
    if (combinedNav) {
      const defaultContentWrappers = combinedNav.querySelectorAll('.default-content-wrapper');
      const navList = combinedNav.querySelector('ul');

      if (navList) {
        navList.classList.add('nav-bar__list');
        navList.querySelectorAll('li.nav-drop').forEach((li) => {
          li.classList.add('nav-bar__item', 'nav-bar__title');
        });
      }

      if (defaultContentWrappers.length > 1) {
        const buttonWrapper = defaultContentWrappers[1];
        const phoneParagraph = buttonWrapper.querySelector('p');
        if (phoneParagraph) {
          phoneParagraph.classList.add('r-desktop-header__phone', 'r-desktop-header__phone-subtext');
          const phoneLink = phoneParagraph.querySelector('a');
          if (phoneLink) {
            phoneLink.classList.add('r-desktop-header__phone-link');
          }
        }
        buttonWrapper.classList.add('nav-bar__tabs');
      }
    }
  }

  // Handle phone element cloning and placement
  const phoneElement = document.querySelector('.r-desktop-header__phone');
  const navBrandElement = document.querySelector('.nav-brand');
  if (phoneElement && navBrandElement) {
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'nav-brand-phone-wrapper';

    const clonedPhoneElement = phoneElement.cloneNode(true);
    clonedPhoneElement.classList.add('r-desktop-header__phone-clone');

    wrapperDiv.appendChild(navBrandElement);
    wrapperDiv.appendChild(clonedPhoneElement);

    nav.insertBefore(wrapperDiv, nav.querySelector('.combined-nav'));
  }
}

