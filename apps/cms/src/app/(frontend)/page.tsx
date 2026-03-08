import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="home">
      <div className="content">
        <span className="eyebrow">templ3 cms / payload node</span>
        {!user && <h1>Editorial sanctum online.</h1>}
        {user && <h1>Welcome back, {user.email}</h1>}
        <p>
          Este panel gestiona los contenidos publicos de <strong>Templ3</strong>: posts, projects,
          links, tags y media. La web publica consume esta API desde Cloudflare Workers.
        </p>
        <div className="links">
          <a
            className="admin"
            href={payloadConfig.routes.admin}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open admin
          </a>
          <a
            className="docs"
            href="https://sigterm.vodka"
            rel="noopener noreferrer"
            target="_blank"
          >
            Visit site
          </a>
        </div>
      </div>
      <div className="footer">
        <p>Neon handles Postgres, R2 stores media and Cloudflare Containers hosts the CMS.</p>
      </div>
    </div>
  )
}
