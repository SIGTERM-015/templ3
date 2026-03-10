import React from 'react'
import './index.css'

const SATORI_SVG_GRID = `url("data:image/svg+xml;utf8,<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M0 0h40v40H0z' fill='none'/><path d='M0 39.5h40M39.5 0v40' stroke='rgba(255,184,0,0.1)' stroke-width='1'/></svg>")`;
const LOGO_URL = "/sigterm-logo.svg";

function PreviewContainer({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 60, width: '100%' }}>
      <h3 style={{ color: '#ccc', fontSize: 18, marginBottom: 15, fontFamily: 'sans-serif', fontWeight: 'bold' }}>{title}</h3>
      <div style={{
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        border: '1px solid #333',
        overflow: 'hidden',
        transform: 'scale(0.65)',
        transformOrigin: 'top center',
        width: 1200,
        height: 630,
        backgroundColor: '#000'
      }}>
        {children}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', maxWidth: '1000px', marginBottom: '80px', padding: '0 20px' }}>
      <h2 style={{ 
        color: '#ff00ff', 
        fontSize: '32px', 
        borderBottom: '2px solid #ff00ff', 
        paddingBottom: '10px', 
        marginBottom: '40px',
        fontFamily: 'sans-serif',
        textTransform: 'uppercase'
      }}>
        {title}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0px' }}>
        {children}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// DIRECTION 1: CLEAN CYBERPUNK (Dark, Grid, Bold Typography, Accents)
// -----------------------------------------------------------------------------

function D1_Dossier() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 1200, height: 630, backgroundColor: '#0d0d0d', backgroundImage: SATORI_SVG_GRID, color: '#ffb800', padding: '60px', position: 'relative' }}>
      <div style={{ height: '12px', width: '100%', backgroundColor: '#ff00ff', position: 'absolute', top: 0, left: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
        <span style={{ fontSize: '24px', color: '#ff00ff', marginBottom: '10px' }}>// OPERATOR PROFILE</span>
        <h1 style={{ fontSize: '110px', margin: 0, letterSpacing: '-4px', lineHeight: 1 }}>SIGTERM</h1>
        <p style={{ fontSize: '32px', color: '#888', marginTop: '30px', maxWidth: '800px', lineHeight: 1.4 }}>
          DevSecOps, hacking, hardware, AI, and a retro cyberpunk aesthetic.
        </p>
      </div>
      <img src={LOGO_URL} style={{ position: 'absolute', bottom: '60px', right: '60px', width: '120px', opacity: 0.15 }} />
    </div>
  )
}

function D1_Arsenal() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 1200, height: 630, backgroundColor: '#0d0d0d', backgroundImage: SATORI_SVG_GRID, color: '#ffb800', padding: '60px', position: 'relative' }}>
      <div style={{ height: '100%', width: '12px', backgroundColor: '#00ffcc', position: 'absolute', top: 0, left: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', marginLeft: '40px' }}>
        <h1 style={{ fontSize: '90px', margin: 0, letterSpacing: '-2px', color: '#00ffcc' }}>ARSENAL</h1>
        <p style={{ fontSize: '30px', color: '#888', marginTop: '20px' }}>Projects, tooling, and weapons of choice.</p>
        <div style={{ display: 'flex', gap: '20px', marginTop: '50px' }}>
          <div style={{ padding: '15px 30px', border: '2px solid #333', color: '#fff', fontSize: '24px' }}>Hardware</div>
          <div style={{ padding: '15px 30px', border: '2px solid #333', color: '#fff', fontSize: '24px' }}>Software</div>
          <div style={{ padding: '15px 30px', border: '2px solid #333', color: '#fff', fontSize: '24px' }}>Services</div>
        </div>
      </div>
      <img src={LOGO_URL} style={{ position: 'absolute', top: '60px', right: '60px', width: '120px', opacity: 0.15 }} />
    </div>
  )
}

function D1_BlogPost() {
  return (
    <div style={{ display: 'flex', width: 1200, height: 630, position: 'relative' }}>
      <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200&h=630" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(10,10,10,0.85)' }} />
      <img src={LOGO_URL} style={{ position: 'absolute', top: '50px', right: '50px', width: '80px', opacity: 0.5, filter: 'invert(1)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <span style={{ fontSize: '24px', color: '#ff00ff', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '40px', height: '2px', backgroundColor: '#ff00ff', marginRight: '15px' }} />
          ARTICLE
        </span>
        <h1 style={{ fontSize: '75px', color: '#ffffff', margin: 0, textShadow: '4px 4px 0px #ff00ff', maxWidth: '1000px', lineHeight: 1.1 }}>
          Building a Retro OS with Astro and React
        </h1>
        <span style={{ fontSize: '24px', color: '#aaa', marginTop: '40px' }}>Published on Oct 24, 2024</span>
      </div>
    </div>
  )
}

function D1_Media() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 1200, height: 630, backgroundColor: '#0d0d0d', backgroundImage: SATORI_SVG_GRID, color: '#ffb800', padding: '60px', position: 'relative' }}>
      <div style={{ height: '12px', width: '100%', backgroundColor: '#ffb800', position: 'absolute', bottom: 0, left: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '600px' }}>
          <h1 style={{ fontSize: '90px', margin: 0, letterSpacing: '-2px', color: '#ffb800' }}>MEDIA</h1>
          <p style={{ fontSize: '30px', color: '#888', marginTop: '20px' }}>Anime, Games, Books, Movies.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', width: '400px', gap: '20px' }}>
          <div style={{ width: '180px', height: '250px', backgroundColor: '#222', border: '1px solid #444' }} />
          <div style={{ width: '180px', height: '250px', backgroundColor: '#222', border: '1px solid #444', transform: 'translateY(40px)' }} />
        </div>
      </div>
      <img src={LOGO_URL} style={{ position: 'absolute', top: '60px', left: '60px', width: '80px', opacity: 0.15 }} />
    </div>
  )
}

// -----------------------------------------------------------------------------
// DIRECTION 2: TEMPL3 OS (Floating Desktop Windows)
// -----------------------------------------------------------------------------

function D2_Dossier() {
  return (
    <div style={{ display: 'flex', width: 1200, height: 630, backgroundColor: '#050505', backgroundImage: SATORI_SVG_GRID, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: 800, height: 500, backgroundColor: '#161616', border: '1px solid #333', boxShadow: '20px 20px 0px rgba(0,0,0,0.8)' }}>
        {/* Window Header */}
        <div style={{ height: '40px', backgroundColor: '#2a2a2a', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', padding: '0 15px', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontSize: '18px', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#ffb800', marginRight: '10px' }}>■</span> dossier.exe
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#555' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#555' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff00ff' }} />
          </div>
        </div>
        {/* Window Content */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '50px', height: '100%', position: 'relative' }}>
          <h1 style={{ fontSize: '60px', color: '#ffb800', margin: 0 }}>SIGTERM</h1>
          <p style={{ fontSize: '24px', color: '#aaa', marginTop: '20px' }}>System Administrator & Operator.</p>
          <div style={{ display: 'flex', marginTop: '40px', gap: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#555', fontSize: '16px' }}>STATUS</span>
              <span style={{ color: '#00ffcc', fontSize: '24px' }}>ONLINE</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#555', fontSize: '16px' }}>LOCATION</span>
              <span style={{ color: '#fff', fontSize: '24px' }}>ES</span>
            </div>
          </div>
          <img src={LOGO_URL} style={{ position: 'absolute', bottom: '40px', right: '40px', width: '100px', opacity: 0.1 }} />
        </div>
      </div>
    </div>
  )
}

function D2_Guestbook() {
  return (
    <div style={{ display: 'flex', width: 1200, height: 630, backgroundColor: '#050505', alignItems: 'center', justifyContent: 'center', backgroundImage: SATORI_SVG_GRID, position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: 700, height: 400, backgroundColor: '#fff', border: '1px solid #ccc', boxShadow: '15px 15px 0px rgba(0,0,0,0.6)', padding: '50px', position: 'relative', transform: 'rotate(-2deg)' }}>
        <div style={{ position: 'absolute', top: '-15px', left: '335px', width: '30px', height: '30px', backgroundColor: '#ff00ff', borderRadius: '50%', border: '4px solid #b300b3' }} />
        <h1 style={{ fontSize: '60px', color: '#111', margin: 0, fontFamily: 'sans-serif', fontWeight: 'bold' }}>Guestbook</h1>
        <p style={{ fontSize: '28px', color: '#666', marginTop: '15px', fontFamily: 'sans-serif' }}>Leave your mark on the system.</p>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ffb800' }} />
          <span style={{ fontSize: '20px', color: '#333' }}>Sign it now...</span>
        </div>
        <img src={LOGO_URL} style={{ position: 'absolute', bottom: '30px', right: '30px', width: '80px', opacity: 0.05, filter: 'invert(1)' }} />
      </div>
    </div>
  )
}

function D2_BlogPost() {
  return (
    <div style={{ display: 'flex', width: 1200, height: 630, backgroundColor: '#050505', backgroundImage: SATORI_SVG_GRID, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200&h=630" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
      <div style={{ display: 'flex', flexDirection: 'column', width: 900, height: 400, backgroundColor: 'rgba(20,20,20,0.95)', border: '1px solid #444', boxShadow: '20px 20px 0px rgba(0,0,0,0.8)', zIndex: 10 }}>
        {/* Editor Header */}
        <div style={{ height: '40px', backgroundColor: '#333', display: 'flex', alignItems: 'center', padding: '0 15px' }}>
          <span style={{ color: '#fff', fontSize: '16px' }}>article_viewer.exe - [Read Only]</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '40px', height: '100%', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '55px', color: '#fff', margin: 0, lineHeight: 1.2 }}>Building a Retro OS with Astro and React</h1>
          <p style={{ fontSize: '24px', color: '#ffb800', marginTop: '20px' }}>&gt; _</p>
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// DIRECTION 3: RAW TERMINAL (Amber monochrome, ASCII, Minimal)
// -----------------------------------------------------------------------------

function D3_Dossier() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 1200, height: 630, backgroundColor: '#000000', color: '#ffb800', padding: '80px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '4px solid #ffb800', boxSizing: 'border-box' }} />
      <div style={{ position: 'absolute', top: '10px', left: '20px', backgroundColor: '#000', padding: '0 10px', fontSize: '24px' }}>SYSTEM TERMINAL</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'monospace' }}>
        <span style={{ fontSize: '30px', marginBottom: '40px' }}>TEMPL3 OS v1.0.0</span>
        <span style={{ fontSize: '30px', marginBottom: '20px' }}>&gt; whoami</span>
        <h1 style={{ fontSize: '100px', margin: '0 0 40px 0', letterSpacing: '4px' }}>SIGTERM</h1>
        <span style={{ fontSize: '30px', color: '#888' }}>&gt; Desc: DevSecOps, hardware, AI.</span>
        <span style={{ fontSize: '30px', color: '#ff00ff', marginTop: 'auto', animation: 'blink 1s step-end infinite' }}>█</span>
      </div>
      <img src={LOGO_URL} style={{ position: 'absolute', bottom: '80px', right: '80px', width: '100px', filter: 'sepia(1) hue-rotate(-30deg) saturate(5) brightness(1.2)' }} />
    </div>
  )
}

function D3_Arsenal() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 1200, height: 630, backgroundColor: '#000000', color: '#00ffcc', padding: '80px', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'monospace' }}>
        <span style={{ fontSize: '30px', marginBottom: '20px' }}>&gt; ls -la /arsenal</span>
        <h1 style={{ fontSize: '80px', margin: '20px 0', letterSpacing: '4px', textDecoration: 'underline' }}>ARSENAL</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <span style={{ fontSize: '28px' }}>drwxr-xr-x  operator  hardware/</span>
          <span style={{ fontSize: '28px' }}>drwxr-xr-x  operator  software/</span>
          <span style={{ fontSize: '28px' }}>drwxr-xr-x  operator  services/</span>
        </div>
      </div>
      <img src={LOGO_URL} style={{ position: 'absolute', bottom: '80px', right: '80px', width: '100px', opacity: 0.5, filter: 'sepia(1) hue-rotate(130deg) saturate(5) brightness(1.2)' }} />
    </div>
  )
}

function D3_BlogPost() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 1200, height: 630, backgroundColor: '#000000', color: '#ffb800', padding: '80px', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'monospace', borderLeft: '4px solid #ff00ff', paddingLeft: '40px' }}>
        <span style={{ fontSize: '30px', marginBottom: '20px', color: '#aaa' }}>cat /blog/retro-os.md</span>
        <h1 style={{ fontSize: '70px', margin: '40px 0', letterSpacing: '0px', lineHeight: 1.2, color: '#fff' }}>
          Building a Retro OS with Astro and React
        </h1>
        <span style={{ fontSize: '24px', color: '#ff00ff', marginTop: 'auto' }}>[ EOF ]</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ padding: '60px 40px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#111' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '48px' }}>Templ3 Open Graph Preview</h1>
        <p style={{ color: '#888', fontSize: '20px' }}>3 Directions for 4 Page Types</p>
      </div>
      
      <Section title="Direction 1: Clean Cyberpunk">
        <PreviewContainer title="Dossier (Index)">
          <D1_Dossier />
        </PreviewContainer>
        <PreviewContainer title="Arsenal">
          <D1_Arsenal />
        </PreviewContainer>
        <PreviewContainer title="Blog Post">
          <D1_BlogPost />
        </PreviewContainer>
        <PreviewContainer title="Media">
          <D1_Media />
        </PreviewContainer>
      </Section>

      <Section title="Direction 2: Templ3 OS (Windowed)">
        <PreviewContainer title="Dossier (Index)">
          <D2_Dossier />
        </PreviewContainer>
        <PreviewContainer title="Guestbook">
          <D2_Guestbook />
        </PreviewContainer>
        <PreviewContainer title="Blog Post">
          <D2_BlogPost />
        </PreviewContainer>
        {/* Fill empty space */}
        <div />
      </Section>

      <Section title="Direction 3: Raw Terminal (Monochrome)">
        <PreviewContainer title="Dossier (Index)">
          <D3_Dossier />
        </PreviewContainer>
        <PreviewContainer title="Arsenal">
          <D3_Arsenal />
        </PreviewContainer>
        <PreviewContainer title="Blog Post">
          <D3_BlogPost />
        </PreviewContainer>
        {/* Fill empty space */}
        <div />
      </Section>

    </div>
  )
}
