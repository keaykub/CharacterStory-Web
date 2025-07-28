// src/components/home/how-it-works-section.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, UserPlus, Edit3, Download } from "lucide-react"
import Link from "next/link"

const steps = [
  {
    step: "1",
    icon: UserPlus,
    title: "สมัครสมาชิก",
    description: "สร้างบัญชีฟรีและรับเครดิต 100 สำหรับเริ่มต้น"
  },
  {
    step: "2", 
    icon: Edit3,
    title: "สร้างตัวละครหรือฉาก",
    description: "ใช้ AI Chat หรือเลือก Template เพื่อสร้างสิ่งที่คุณต้องการ"
  },
  {
    step: "3",
    icon: Download,
    title: "ส่งออกและใช้งาน",
    description: "คัดลอก prompt ไปใช้งานใน VEO3 หรือเครื่องมือ AI อื่นๆ"
  }
]

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            เริ่มใช้งานง่ายๆ ใน 3 ขั้นตอน
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ไม่ซับซ้อน ไม่ยุ่งยาก เริ่มสร้างตัวละครและฉากของคุณได้ทันที
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                <Card className="text-center border-border/50">
                  <CardContent className="p-8">
                    {/* Step Number */}
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                      {step.step}
                    </div>
                    
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Arrow (except last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/generate">
            <Button size="lg" className="text-lg px-8 py-6">
              เริ่มสร้างเลย
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}