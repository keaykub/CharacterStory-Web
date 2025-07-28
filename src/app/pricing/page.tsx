// src/app/pricing/page.tsx
import { PricingPlans } from "@/components/pricing/pricing-plans"
import { PricingFAQ } from "@/components/pricing/pricing-faq"

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <PricingPlans />
      <PricingFAQ />
    </div>
  )
}