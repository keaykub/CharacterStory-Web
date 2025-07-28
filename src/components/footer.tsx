// src/components/footer/footer.tsx
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { 
  Github, 
  Twitter, 
  Mail, 
  MapPin,
  ExternalLink
} from "lucide-react"

const footerLinks = {
  product: [
    { label: "หน้าหลัก", href: "/" },
    { label: "ออกแบบ", href: "/generate" },
    { label: "แผนราคา", href: "/pricing" },
    { label: "คลังของฉัน", href: "/inventory" },
  ],
  support: [
    { label: "ช่วยเหลือ", href: "/help" },
    { label: "คำถามที่พบบ่อย", href: "#faq" },
    { label: "ติดต่อเรา", href: "/contact" },
    { label: "สถานะระบบ", href: "/status" },
  ],
  legal: [
    { label: "เงื่อนไขการใช้งาน", href: "/terms" },
    { label: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
    { label: "นโยบายคุกกี้", href: "/cookies" },
    { label: "ข้อกำหนดการใช้งาน", href: "/guidelines" },
  ],
  integration: [
    { label: "VEO3", href: "https://veo3.ai", external: true },
    { label: "Midjourney", href: "https://midjourney.com", external: true },
    { label: "API Documentation", href: "/docs" },
    { label: "Developer Tools", href: "/developers" },
  ]
}

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
  { label: "GitHub", href: "https://github.com", icon: Github },
  { label: "Email", href: "mailto:hello@characterstory-ai.com", icon: Mail },
]

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">CharacterStory-AI</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                เครื่องมือสร้างตัวละครและฉากด้วย AI 
                สำหรับ VEO3 และแพลตฟอร์มอื่นๆ
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="w-9 h-9 rounded-lg bg-background border border-border/50 flex items-center justify-center hover:border-border transition-colors"
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">ผลิตภัณฑ์</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">ช่วยเหลือ</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Integration Links */}
          <div>
            <h4 className="font-semibold mb-4">การเชื่อมต่อ</h4>
            <ul className="space-y-3">
              {footerLinks.integration.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                  >
                    {link.label}
                    {link.external && <ExternalLink className="h-3 w-3" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">ข้อกำหนด</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© 2025 CharacterStory-AI. สงวนลิขสิทธิ์</span>
            <div className="hidden md:flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>Bangkok, Thailand</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted-foreground">
              Made with ❤️ for creators
            </span>
            <Link 
              href="/status" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>ระบบทำงานปกติ</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}