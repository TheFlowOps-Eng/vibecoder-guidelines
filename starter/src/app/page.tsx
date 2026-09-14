import { homeContent } from '@/content/home';
import { HeroLayouts } from '@/components/sections/Hero';
import { ServicesLayouts } from '@/components/sections/Services';
import { AboutLayouts } from '@/components/sections/About';
import { TestimonialsLayouts } from '@/components/sections/Testimonials';
import { CTALayouts } from '@/components/sections/CTA';

export default function HomePage() {
  const Hero = HeroLayouts[homeContent.hero.layout].component;
  const Services = ServicesLayouts[homeContent.services.layout].component;
  const About = AboutLayouts[homeContent.about.layout].component;
  const Testimonials = TestimonialsLayouts[homeContent.testimonials.layout].component;
  const CTA = CTALayouts[homeContent.cta.layout].component;

  return (
    <>
      <Hero sectionId="home-hero" content={homeContent.hero.content} />
      <Services content={homeContent.services.content} sectionId="home-services" />
      <About sectionId="home-about" content={homeContent.about.content} />
      <Testimonials sectionId="home-testimonials" content={homeContent.testimonials.content} />
      <CTA sectionId="home-cta" content={homeContent.cta.content} />
    </>
  );
}
