import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Scribe AI - Assistente de Formulários',
  description: 'Assistente inteligente para preenchimento de formulários',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Script 
          src="/scribe-ai.js" 
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  )
}
