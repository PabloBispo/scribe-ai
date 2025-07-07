import './globals.css';

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
      <body>{children}</body>
    </html>
  )
}
