/* eslint-disable @next/next/no-img-element */
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
        <img src="/sigterm-logo.svg" alt="Templ3" className="logo" />
        <span className="eyebrow">templ3 cms</span>
        {!user && <h1>EDITORIAL SANCTUM</h1>}
        {user && (
          <>
            <h1>WELCOME BACK</h1>
            <div className="status-line">
              <span className="status-dot" />
              {user.email}
            </div>
          </>
        )}
        <p>
          Content management node for sigterm.vodka — posts, projects, links, media and tags.
        </p>
        <div className="links">
          <a className="admin" href={payloadConfig.routes.admin}>
            Enter admin
          </a>
          <a className="docs" href="https://sigterm.vodka" rel="noopener noreferrer" target="_blank">
            Visit site
          </a>
        </div>
      </div>
      <div className="footer">
        <p>Neon &middot; R2 &middot; Cloudflare Workers</p>
      </div>
    </div>
  )
}
