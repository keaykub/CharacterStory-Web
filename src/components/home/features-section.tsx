// src/components/home/features-section.tsx
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, 
  Video, 
  Zap, 
  Globe, 
  Palette, 
  MessageSquare 
} from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Character Creator",
    description: "สร้างตัวละครโดยละเอียดด้วย AI พร้อมแชทเพื่อปรับแต่งตามต้องการ"
  },
  {
    icon: Video,
    title: "Scene Creator", 
    description: "สร้างฉากจากคำบรรยายภาษาไทย แปลงเป็น prompt ภาษาอังกฤษอัตโนมัติ"
  },
  {
    icon: Zap,
    title: "VEO3 Integration",
    description: "ใช้งานร่วมกับ VEO3 ได้ทันที ส่งออก prompt ที่พร้อมใช้งาน"
  },
  {
    icon: Globe,
    title: "รองรับภาษาไทย",
    description: "อินเทอร์เฟซและการสร้างเนื้อหาภาษาไทยที่เข้าใจง่าย"
  },
  {
    icon: Palette,
    title: "Template Library",
    description: "เลือกใช้ template ตัวละครสำเร็จรูป เช่น นักรบ นักสืบ แม่มด"
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description: "แชทกับ AI เพื่อช่วยสร้างและปรับแต่งตัวละครให้ตรงใจ"
  }
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ฟีเจอร์เด่นของ CharacterStory-AI
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            เครื่องมือครบครันสำหรับการสร้างตัวละครและฉากด้วย AI 
            ที่ออกแบบมาเพื่อความง่ายและประสิทธิภาพ
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-border/50 hover:border-border transition-colors group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}