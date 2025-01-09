// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.classList.add('deal-cards__tab-container');
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');


    // Add the deals card decoration for this tabpanel
    decorateDeals(tabpanel);

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.classList.add('deal-cards__tab');
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);
}


// Add the decorateDeals function to modify each tabpanel
function decorateDeals(tabpanel) {
    const dealsPanel = tabpanel;
  
    if (dealsPanel) {
      // Add the class to the parent container
      dealsPanel.classList.add('deal-cards__list');
  
      // Select all deal items (direct child divs)
      const dealItems = dealsPanel.querySelectorAll(':scope > div');
  
      dealItems.forEach((item) => {
        // Add the class for individual deal items
        item.classList.add('deal-cards__item');

        const images = item.querySelectorAll('img');
        images.forEach((img) => {
            img.classList.add('deal-cards__image');
        });
  
        const paragraphs = item.querySelectorAll('p');
  
        if (paragraphs.length > 0) {
          // First <p> is for the image, wrap it with `deal-cards__content`
          const imageContainer = paragraphs[0];
          const wrapper = document.createElement('div');
          wrapper.classList.add('deal-cards__content');
          item.insertBefore(wrapper, imageContainer);
          wrapper.appendChild(imageContainer);

         const groupedContent = document.createElement('div');
         groupedContent.classList.add('deal-cards__details');
         item.appendChild(groupedContent);

         // Add `.deal-cards__location` and `.deal-cards__cta` into the grouped div
         const location = paragraphs[1];
         if (location) {
            location.classList.add('deal-cards__location');
            groupedContent.appendChild(location);
         }
  
         const cta = paragraphs[2];
         if (cta) {
            cta.classList.add('deal-cards__cta');
            groupedContent.appendChild(cta);
         }
        }
      });
    }
  }