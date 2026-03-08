import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Templ3 CMS for sigterm.vodka.',
  title: 'Templ3 CMS',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
