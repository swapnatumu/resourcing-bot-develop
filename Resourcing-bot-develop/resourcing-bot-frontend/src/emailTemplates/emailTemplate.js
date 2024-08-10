// emailTemplates.js

import emailTemplatesJSON from './emailTemplate.json';

let templates = emailTemplatesJSON;

export function getEmailTemplate(templateName) {
  if (!templates[templateName]) {
    throw new Error(`Template ${templateName} not found in emailTemplates.json`);
  }
  return templates[templateName];
}
