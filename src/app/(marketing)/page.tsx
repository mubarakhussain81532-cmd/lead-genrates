import { Suspense } from "react";
import HeroSection from "@/components/home/hero-section";
import {
  CompanyIntro,
  HowItWorks,
  IndustriesSection,
  MetricsStrip,
  WhyChooseUs,
} from "@/components/home/overview-sections";
import {
  DatabasesSection,
  ServicesSection,
} from "@/components/home/catalog-sections";
import {
  ContactSection,
  FaqSection,
  TestimonialsSection,
} from "@/components/home/trust-sections";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <MetricsStrip />
      <CompanyIntro />
      <Suspense
        fallback={
          <section className="min-h-96 animate-pulse bg-[#f7faf9]" />
        }
      >
        <ServicesSection />
      </Suspense>
      <DatabasesSection />
      <WhyChooseUs />
      <HowItWorks />
      <IndustriesSection />
      <Suspense
        fallback={
          <section className="min-h-80 animate-pulse bg-[#f1f6f4]" />
        }
      >
        <TestimonialsSection />
      </Suspense>
      <Suspense
        fallback={<section className="min-h-80 animate-pulse bg-white" />}
      >
        <FaqSection />
      </Suspense>
      <ContactSection />
    </main>
  );
}
