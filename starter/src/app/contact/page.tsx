import { contactContent } from '@/content/contact';
import { ContactLayouts } from '@/components/sections/Contact';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Contact',
  description: "Let's work together. Tell us about your project.",
  path: '/contact',
});

export default function ContactPage() {
  const Contact = ContactLayouts[contactContent.layout].component;

  return <Contact sectionId="contact-form" content={contactContent.content} />;
}
