// src/components/pricing/pricing-plans.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Check, 
  Zap, 
  Star, 
  Crown,
  ArrowRight
} from "lucide-react"

const plans = [
  {
    id: "basic",
    name: "Basic",
    credits: 100,
    price: 99,
    description: "เหมาะสำหรับผู้เริ่มต้นและการทดลองใช้งาน",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    features: [
      "เครดิต +100",
      "สร้างตัวละครได้ 100 ครั้ง",
      "สร้างฉากได้ 100 ครั้ง", 
      "บันทึกในคลังไม่จำกัด",
      "แปลภาษาฟรี",
      "Template พื้นฐาน"
    ],
    popular: false
  },
  {
    id: "pro", 
    name: "Pro",
    credits: 300,
    price: 249,
    description: "เหมาะสำหรับ Creator และผู้ใช้งานสม่ำเสมอ",
    icon: Star,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    features: [
      "เครดิต +300",
      "สร้างตัวละครได้ 300 ครั้ง",
      "สร้างฉากได้ 300 ครั้ง",
      "บันทึกในคลังไม่จำกัด", 
      "แปลภาษาฟรี",
      "Template ครบชุด",
      "AI Chat ขั้นสูง",
      "การสนับสนุนลำดับความสำคัญ"
    ],
    popular: true
  },
  {
    id: "plus",
    name: "Plus", 
    credits: 1000,
    price: 699,
    description: "เหมาะสำหรับทีมงานและโปรเจคขนาดใหญ่",
    icon: Crown,
    color: "text-orange-500", 
    bgColor: "bg-orange-500/10",
    features: [
      "เครดิต +1,000",
      "สร้างตัวละครได้ 1,000 ครั้ง",
      "สร้างฉากได้ 1,000 ครั้ง",
      "บันทึกในคลังไม่จำกัด",
      "แปลภาษาฟรี", 
      "Template ครบชุด + Premium",
      "AI Chat ขั้นสูง",
      "การสนับสนุน 24/7",
      "API Access (เร็วๆ นี้)",
      "Custom Template (เร็วๆ นี้)"
    ],
    popular: false
  }
]

export function PricingPlans() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            เลือกแผนที่เหมาะกับคุณ
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            ซื้อเครดิตเพิ่มเติมเพื่อสร้างตัวละครและฉากได้ไม่จำกัด 
            ทุกแผนไม่มีการหักเงินรายเดือน
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card 
                key={plan.id} 
                className={`relative border-2 transition-all hover:shadow-lg ${
                  plan.popular 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'border-border/50 hover:border-border'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      แนะนำ
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-full ${plan.bgColor} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`h-8 w-8 ${plan.color}`} />
                  </div>
                  
                  {/* Plan Name */}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  
                  {/* Price */}
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-3xl font-bold">฿{plan.price}</span>
                      <span className="text-muted-foreground">ครั้งเดียว</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      +{plan.credits.toLocaleString()} เครดิต
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button 
                    size="lg" 
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    เลือกแผน {plan.name}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  {/* Note */}
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    * ระบบชำระเงินเร็วๆ นี้
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}