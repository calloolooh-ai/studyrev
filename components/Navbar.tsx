'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/pastpapers', label: 'Past Papers' },
    { href: '/saved', label: 'Saved' },
    { href: '/search', label: 'Search' },
  ]

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(8,12,16,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '56px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 28, height: 28, background: 'var(--cyan)', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 800, color: 'var(--bg)', fontFamily: 'var(--font-mono)',
          }}>SR</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px' }}>
            Study<span style={{ color: 'var(--cyan)' }}>Rev</span>
          </span>
        </Link>

        <div className="desktop-nav" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {publicLinks.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '6px 14px', borderRadius: '6px', fontSize: '14px', fontWeight: 500,
              color: isActive(l.href) ? 'var(--cyan)' : 'var(--text2)',
              background: isActive(l.href) ? 'var(--cyan-dim)' : 'transparent',
              transition: 'all 0.15s',
            }}>{l.label}</Link>
          ))}
          {isAdmin && (
            <Link href="/admin" style={{
              padding: '6px 14px', borderRadius: '6px', fontSize: '14px', fontWeight: 500,
              color: isActive('/admin') ? 'var(--amber)' : 'var(--text2)',
              background: isActive('/admin') ? 'var(--amber-dim)' : 'transparent',
              border: '1px solid var(--amber-dim)', transition: 'all 0.15s',
            }}>Admin</Link>
          )}
          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />
          {user ? (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <Link href="/account" style={{
                padding: '6px 14px', borderRadius: '6px', fontSize: '14px', fontWeight: 500,
                color: isActive('/account') ? 'var(--cyan)' : 'var(--text2)',
                background: isActive('/account') ? 'var(--cyan-dim)' : 'transparent',
              }}>
                {profile?.display_name || user.email?.split('@')[0] || 'Account'}
              </Link>
              <button onClick={handleSignOut} style={{
                padding: '6px 12px', borderRadius: '6px', fontSize: '13px',
                background: 'transparent', border: '1px solid var(--border2)',
                color: 'var(--text3)', cursor: 'pointer',
              }}>Sign out</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <Link href="/login" style={{
                padding: '6px 14px', borderRadius: '6px', fontSize: '14px',
                color: 'var(--text2)', border: '1px solid var(--border2)',
              }}>Log in</Link>
              <Link href="/signup" style={{
                padding: '6px 14px', borderRadius: '6px', fontSize: '14px',
                background: 'var(--cyan)', color: 'var(--bg)', fontWeight: 600,
              }}>Sign up</Link>
            </div>
          )}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text)', fontSize: '20px', padding: '4px', display: 'none',
        }}>{menuOpen ? 'x' : '='}</button>
      </div>

      {menuOpen && (
        <div style={{
          borderTop: '1px solid var(--border)', padding: '12px 20px',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {publicLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{
              padding: '10px 14px', borderRadius: '6px', fontSize: '14px',
              color: isActive(l.href) ? 'var(--cyan)' : 'var(--text)',
              background: isActive(l.href) ? 'var(--cyan-dim)' : 'transparent',
            }}>{l.label}</Link>
          ))}
          {isAdmin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} style={{
              padding: '10px 14px', borderRadius: '6px', fontSize: '14px', color: 'var(--amber)',
            }}>Admin</Link>
          )}
          <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
          {user ? (
            <>
              <Link href="/account" onClick={() => setMenuOpen(false)} style={{
                padding: '10px 14px', borderRadius: '6px', fontSize: '14px', color: 'var(--text)',
              }}>Account</Link>
              <button onClick={() => { handleSignOut(); setMenuOpen(false) }} style={{
                padding: '10px 14px', borderRadius: '6px', fontSize: '14px',
                background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', textAlign: 'left',
              }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                padding: '10px 14px', borderRadius: '6px', fontSize: '14px', color: 'var(--text)',
              }}>Log in</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} style={{
                padding: '10px 14px', borderRadius: '6px', fontSize: '14px',
                color: 'var(--cyan)', fontWeight: 600,
              }}>Sign up</Link>
            </>
          )}
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}