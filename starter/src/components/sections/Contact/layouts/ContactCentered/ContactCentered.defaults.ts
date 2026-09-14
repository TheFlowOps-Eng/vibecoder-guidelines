import type { ContactCenteredContent } from './ContactCentered.types';

export const ContactCenteredDefaults: ContactCenteredContent = {
  heading: "Let's work together.",
  subheading: 'Tell us about your project and we\'ll get back to you within 24 hours.',
  formFields: [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'Email address', required: true },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      placeholder: 'Tell us about your project',
      required: true,
    },
  ],
  submitLabel: 'Send message',
};
