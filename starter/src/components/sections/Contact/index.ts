import { ContactCentered } from './layouts/ContactCentered/ContactCentered';
import { ContactCenteredDefaults } from './layouts/ContactCentered/ContactCentered.defaults';

export const ContactLayouts = {
  centered: { component: ContactCentered, defaults: ContactCenteredDefaults },
} as const;

export type ContactLayoutKey = keyof typeof ContactLayouts;
