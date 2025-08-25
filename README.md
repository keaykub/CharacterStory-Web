# CharacterStory-Web

A simple web app for generating character-driven stories with prompt controls and export options.

## Demo
- Live: https://characterstory-web-production.up.railway.app/

## Features
- Prompt builder: ช่วยวางเค้าโครงตัวละคร/โลก/โทนเรื่อง
- Pre-made templates: ตัวละคร/แนวเรื่องยอดนิยม (ปรับได้)
- Scene-by-scene generation: แต่งทีละซีน แก้คำสั่งได้
- Save & Export: บันทึกตัวละครที่ชอบ, คัดลอก/ดาวน์โหลดไฟล์
- History: ดูบันทึกตัวละครเก่าๆที่เราติดตาวไว้ได้
- Auth (optional): login เพื่อเก็บโปรเจกต์ส่วนตัว

## Tech Stack
- Frontend: Next.js / React / Tailwind CSS
- Backend: (เลือกของคุณ) e.g., Next.js
- DB/Storage: MySQL / Supabase / S3-compatible
- AI Provider: OpenAI/Claude/Local API (เลือกใส่ของจริงใน .env)
- Deploy: Vercel / Railway / VPS

## Demo Version
- เป็น Demo Mockup version เท่านั้น

## Quick Start
```bash
git clone <repo-url>
cd characterstory-web
# ถ้าเป็น Next.js
npm install
cp .env.example .env   # เติมค่าคีย์และ API endpoint
npm run dev
