export default function decorate(block) {
    const firstLink = block.querySelector('a');
    firstLink.classList.add('active');
  }