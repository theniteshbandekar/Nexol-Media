import { HeroSection } from "@/components/sections/hero";
import { VslSection } from "@/components/sections/vsl";
import { ServicesSection } from "@/components/sections/services";
import { StatsSection } from "@/components/sections/stats";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { HookSection } from "@/components/sections/hook";
import { getHomePage } from "@/lib/sanity/home-page";

export default async function HomePage() {
  const home = await getHomePage();
  return (
    <>
      <HeroSection hero={home.hero} />
      <VslSection vsl={home.vsl} />
      <ServicesSection />
      <StatsSection stats={home.stats} />
      <TestimonialsSection cards={home.testimonials} />
      <HookSection hook={home.hook} />
    </>
  );
}
