// src/components/home/faq-section.tsx
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import Link from "next/link"

const faqs = [
  {
    question: "CharacterStory-AI คืออะไร?",
    answer: "CharacterStory-AI คือเครื่องมือสำหรับสร้างตัวละครและฉากวิดีโอคุณภาพสูงด้วย AI เพื่อใช้งานในแพลตฟอร์ม VEO3 โดยรองรับภาษาไทยและใช้งานง่าย"
  },
  {
    question: "ใช้งานฟรีได้หรือไม่?",
    answer: "ใช่ คุณสามารถใช้งานฟรีได้โดยจะได้รับเครดิต 100 ต่อวัน สำหรับการใช้งานเบื้องต้น หากต้องการเครดิตเพิ่มเติมสามารถซื้อแพ็คเกจเสริมได้"
  },
  {
    question: "เครดิตใช้สำหรับอะไรบ้าง?",
    answer: "เครดิตใช้สำหรับการส่งข้อความกับ AI (แชทหรือสร้างตัวละคร/ฉาก) โดยใช้ 1 เครดิตต่อข้อความ ส่วนการคัดลอก แปลภาษา หรือบันทึกเป็นฟรี"
  },
  {
    question: "สามารถใช้งานร่วมกับ VEO3 ได้อย่างไร?",
    answer: "เมื่อสร้างตัวละครหรือฉากเสร็จแล้ว ระบบจะสร้าง prompt ที่พร้อมใช้งาน คุณสามารถคัดลอกไปใช้ใน VEO3 หรือเครื่องมือ AI อื่นๆ ได้ทันที"
  },
  {
    question: "รองรับภาษาไทยแค่ไหน?",
    answer: "รองรับภาษาไทยเต็มรูปแบบทั้งในการป้อนข้อมูล การสร้างเนื้อหา และอินเทอร์เฟซ พร้อมระบบแปลภาษาอัตโนมัติระหว่างไทย-อังกฤษ"
  },
  {
    question: "สามารถบันทึกและจัดการผลงานได้หรือไม่?",
    answer: "ได้ คุณสามารถบันทึกตัวละครและฉากที่สร้างไว้ในคลัง แล้วนำมาใช้งานซ้ำหรือแก้ไขได้ตลอดเวลา"
  },
  {
    question: "มี Template ให้เลือกใช้หรือไม่?",
    answer: "มี เรามี Template ตัวละครสำเร็จรูปหลากหลายแบบ เช่น นักรบ นักสืบ แม่มด ที่คุณสามารถเลือกใช้เป็นจุดเริ่มต้นแล้วปรับแต่งได้"
  },
  {
    question: "หากมีปัญหาการใช้งานต้องติดต่อที่ไหน?",
    answer: "คุณสามารถติดต่อทีมสนับสนุนผ่านอีเมล หรือใช้ระบบแชทสนับสนุนในเว็บไซต์ เราพร้อมช่วยเหลือตลอด 24/7"
  }
]

export function FAQSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            คำถามที่พบบ่อย
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            คำตอบสำหรับคำถามที่ผู้ใช้งานสอบถามบ่อยที่สุด
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mb-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center p-8 rounded-lg bg-muted/30 border border-border/50">
          <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            ยังหาคำตอบไม่เจอ?
          </h3>
          <p className="text-muted-foreground mb-6">
            ทีมสนับสนุนของเราพร้อมช่วยเหลือคุณตลอด 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline">
              <MessageCircle className="mr-2 h-4 w-4" />
              แชทสนับสนุน
            </Button>
            <Button variant="outline">
              ส่งอีเมลถาม
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}