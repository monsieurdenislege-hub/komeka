import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Legebot — Rédige. Apprends. Réussis.',
  description: "Application IA de rédaction de dissertation pour les élèves et enseignants de la RDC.",
  keywords: ['dissertation', 'RDC', 'Congo', 'EXETAT', 'IA', 'éducation'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#0E0F14] text-[#F0F0F5]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
