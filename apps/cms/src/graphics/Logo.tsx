/* eslint-disable @next/next/no-img-element */
import React from 'react'

export const Logo: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <img
        src="/sigterm-logo.svg"
        alt="Templ3"
        style={{
          width: '80px',
          height: '80px',
          filter: 'drop-shadow(0 0 12px oklch(45% 0.22 350 / 0.5))',
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            margin: 0,
            fontSize: '28px',
            fontFamily: "'Monaspace Neon', monospace",
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'oklch(72% 0.14 80)',
          }}
        >
          TEMPL3
        </h1>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: '11px',
            fontFamily: "'Monaspace Neon', monospace",
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'oklch(65% 0.02 60)',
          }}
        >
          Content Management System
        </p>
      </div>
    </div>
  )
}
