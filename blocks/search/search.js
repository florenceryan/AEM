import { decorateIcons } from '../../scripts/aem.js';

// Create a utility function for generating form field input element
function createInputElement(field) {
  const el = document.createElement(field.Element);
  el.id = field.Name;
  el.name = field.Name;

  // Set attributes if available
  if (field.Type) el.type = field.Type;
  if (field.Placeholder) el.placeholder = field.Placeholder;
  if (field.Value) el.value = field.Value;
  el.className = 'field';

  return el;
}

// Create a utility function for generating the label element
function createLabel(field, label) {
  if (!field.Label) return null;
  const fieldLabel = document.createElement('label');
  fieldLabel.textContent = label.textContent || field.Label;
  fieldLabel.htmlFor = field.Name;
  return fieldLabel;
}

// Create a utility function for generating the icon element
function createIcon(field) {
  if (!field.Icon) return null;
  const icon = document.createElement('span');
  icon.className = `icon icon-${field.Icon}`;
  return icon;
}

// Create the form field container and assemble all elements
function createField(form, field, label) {
  const fieldWrapper = document.createElement('div');

  const input = createInputElement(field);
  const labelElement = createLabel(field, label);
  const iconElement = createIcon(field);

  // Append label, icon, and input elements to the field wrapper
  if (labelElement) fieldWrapper.appendChild(labelElement);
  if (iconElement) fieldWrapper.appendChild(iconElement);
  fieldWrapper.appendChild(input);

  form.appendChild(fieldWrapper);

  // Decorate icons if needed
  decorateIcons(fieldWrapper);
}

// Fetch the form content and build the form
export default async function decorate(block) {
  const form = document.createElement('form');
  const labels = block.querySelectorAll(':scope > div div p');
  const formContent = await fetch('search.json')
    .then(res => res.json())
    .then(({ data }) => data)
    .catch(err => console.error("Couldn't load form content", err));

  formContent.forEach((field, i) => createField(form, field, labels[i]));
  block.textContent = '';
  block.appendChild(form);

  addEvents();
}
