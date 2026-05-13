import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Liveshop Zen',
    template: '%s | Liveshop Zen',
  },
  description: 'Premium Live Commerce & Shoppable Video Platform',
  robots: { index: false, follow: false },
};

import { CartProvider } from '@/context/CartContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-black text-white antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
