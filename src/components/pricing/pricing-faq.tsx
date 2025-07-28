// src/components/pricing/pricing-faq.tsx
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { MessageCircle, CreditCard } from "lucide-react"

const pricingFaqs = [
  {
    question: "เครดิตหมดอายุหรือไม่?",
    answer: "ไม่ เครดิตที่คุณซื้อจะไม่มีวันหมดอายุ คุณสามารถใช้งานได้ตลอดเวลาไม่จำกัด"
  },
  {
    question: "สามารถยกเลิกการซื้อได้หรือไม่?",
    answer: "เนื่องจากเป็นการซื้อเครดิตแบบครั้งเดียว ไม่ใช่การสมัครสมาชิกรายเดือน จึงไม่สามารถยกเลิกได้ แต่เรามีนโยบายคืนเงินภายใน 7 วันหากไม่พอใจ"
  },
  {
    question: "มีส่วนลดสำหรับการซื้อเป็นจำนวนมากหรือไม่?",
    answer: "แผน Plus ให้ค่าเครดิตต่อบาทที่คุ้มค่าที่สุดแล้ว สำหรับองค์กรหรือทีมงานขนาดใหญ่ สามารถติดต่อเราเพื่อขอใบเสนอราคาพิเศษ"
  },
  {
    question: "ระบบชำระเงินรองรับอะไรบ้าง?",
    answer: "รองรับบัตรเครดิต/เดบิต, QR Code PromptPay, การโอนเงินผ่านธนาคาร และ TrueMoney Wallet (ระบบชำระเงินจะเปิดใช้งานเร็วๆ นี้)"
  },
  {
    question: "จะได้ใบเสร็จหรือไม่?",
    answer: "ได้ ระบบจะส่งใบเสร็จอิเล็กทรอนิกส์ไปยังอีเมลของคุณทันทีหลังการชำระเงิน รวมถึงสามารถดาวน์โหลดจากหน้าบัญชีได้"
  },
  {
    question: "เครดิตฟรีรายวันยังคงได้รับหรือไม่?",
    answer: "ใช่ แม้จะซื้อเครดิตเพิ่มแล้ว คุณยังคงได้รับเครดิตฟรี 100 ต่อวันตามปกติ"
  },
  {
    question: "สามารถแบ่งปันเครดิตให้คนอื่นได้หรือไม่?",
    answer: "ขณะนี้ยังไม่รองรับการแบ่งปันเครดิต แต่เรากำลังพัฒนาฟีเจอร์ Team Workspace ที่จะรองรับการแบ่งปันเครดิตในทีม"
  },
  {
    question: "มีการรับประกันคุณภาพหรือไม่?",
    answer: "เรารับประกันคุณภาพของผลลัพธ์ AI หากไม่พอใจภายใน 7 วันแรก สามารถขอคืนเงินได้เต็มจำนวน โดยไม่ต้องมีเงื่อนไข"
  },
  {
    question: "แผนราคาจะเปลี่ยนแปลงในอนาคตหรือไม่?",
    answer: "ราคาอาจปรับเปลี่ยนตามต้นทุนการให้บริการ แต่เครดิตที่ซื้อไปแล้วจะไม่ถูกเปลี่ยนแปลงมูลค่า และเรื่องจะแจ้งล่วงหน้า 30 วันก่อนการเปลี่ยนแปลง"
  }
]

export function PricingFAQ() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            คำถามเกี่ยวกับการซื้อเครดิต
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            คำตอบสำหรับคำถามที่พบบ่อยเกี่ยวกับแผนราคาและการชำระเงิน
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mb-12">
          <Accordion type="single" collapsible className="w-full">
            {pricingFaqs.map((faq, index) => (
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
      </div>
    </section>
  )
}