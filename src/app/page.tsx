import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { HowItWorksSection } from "@/components/home/how-it-works-section"
import { FAQSection } from "@/components/home/faq-section"

export default function Home() {
  return (
    <div>
      <main className="min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FAQSection />
      </main>
    </div>
  );
}
