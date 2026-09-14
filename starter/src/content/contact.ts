import type { ContactCenteredContent } from '@/components/sections/Contact/layouts/ContactCentered/ContactCentered.types';

export const contactContent = {
  layout: 'centered' as const,
  content: {
    heading: "Let's work together.",
    subheading:
      "Tell us about your project and we'll get back to you within 24 hours.",
    formFields: [
      {
        name: 'name',
        label: 'Name',
        placeholder: 'Your name',
        type: 'text',
        required: true,
      },
      {
        name: 'email',
        label: 'Email',
        placeholder: 'Email address',
        type: 'email',
        required: true,
      },
      {
        name: 'message',
        label: 'Message',
        placeholder: 'Tell us about your project',
        type: 'textarea',
        required: true,
      },
    ],
    submitLabel: 'Send message',
  } satisfies ContactCenteredContent,
};
