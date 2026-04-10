'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/', label: 'Home' },
    { href: '/saved', label: 'Saved' },
    { href: '/search', label: 'Search' },
  ]

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(8,12,16,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 28,
            height: 28,
            background: 'var(--cyan)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 800,
            color: 'var(--bg)',
            fontFamily: 'var(--font-mono)',
          }}>SR</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px' }}>
            Study<span style={{ color: 'var(--cyan)' }}>Rev</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="desktop-nav">
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              color: pathname === l.href ? 'var(--cyan)' : 'var(--text2)',
              background: pathname === l.href ? 'var(--cyan-dim)' : 'transparent',
              transition: 'all 0.15s',
            }}>{l.label}</Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text)',
            fontSize: '20px',
            padding: '4px',
            display: 'none',
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }} className="mobile-menu">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '14px',
                color: pathname === l.href ? 'var(--cyan)' : 'var(--text)',
                background: pathname === l.href ? 'var(--cyan-dim)' : 'transparent',
              }}>{l.label}</Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
