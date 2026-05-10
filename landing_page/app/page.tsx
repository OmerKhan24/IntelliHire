import { Navbar } from '@/components/sections/navbar';
import { HeroSection } from '@/components/sections/hero-section';
import { TechStrip } from '@/components/sections/tech-strip';
import { ProblemSection } from '@/components/sections/problem-section';
import { AboutSection } from '@/components/sections/about-section';
import { HowItWorksSection } from '@/components/sections/how-it-works-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { MockReportTeaser } from '@/components/sections/mock-report-teaser';
import { VideoDemoSection } from '@/components/sections/video-demo-section';
import { SocialProofSection } from '@/components/sections/social-proof-section';
import { LaunchingSoon } from '@/components/sections/launching-soon';
import { PricingSection } from '@/components/sections/pricing-section';
import { FAQSection } from '@/components/sections/faq-section';
import { CTASection } from '@/components/sections/cta-section';
import { Footer } from '@/components/sections/footer';

export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar is fixed-positioned, overlays all content */}
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <AboutSection />
      <HowItWorksSection />
      <TechStrip />
      <FeaturesSection />
      <MockReportTeaser />
      <VideoDemoSection />
      <SocialProofSection />
      <LaunchingSoon />
      <PricingSection />
      <FAQSection />
      {/* Footer gap blends seamlessly with CTA section */}
      <CTASection />
      <Footer />
    </div>
  );
}
