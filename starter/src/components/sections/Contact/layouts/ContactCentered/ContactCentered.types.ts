import type { ContactSharedContent } from '../../Contact.types';

export interface ContactFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea';
  placeholder?: string;
  required?: boolean;
}

export interface ContactCenteredContent extends ContactSharedContent {
  formFields: ContactFormField[];
  submitLabel: string;
}
