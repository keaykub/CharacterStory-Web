// lib/fonts.ts
import { Inter, Noto_Sans_Thai, Kanit } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  display: 'swap',
});

export const kanit = Kanit({
  weight: ['300', '400', '500', '600', '700'], // เลือกน้ำหนักที่คุณต้องการ
  subsets: ['thai', 'latin'], // สำคัญ: ต้องมี 'thai'
  display: 'swap',
});