'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { migrateLocalStorageToSupabase } from '@/lib/storage'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.user) {
      await migrateLocalStorageToSupabase(data.user.id)
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="container" style={{ paddingTop: '80px', maxWidth: '420px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          width: 48, height: 48, background: 'var(--cyan)', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 800, color: 'var(--bg)',
          fontFamily: 'var(--font-mono)', margin: '0 auto 16px',
        }}>SR</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '8px' }}>
          Welcome back
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
          Log in to sync your progress across devices
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '6px', fontWeight: 500 }}>
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '6px', fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--red-dim)', border: '1px solid rgba(255,77,106,0.3)',
              borderRadius: '8px', padding: '10px 14px',
              color: 'var(--red)', fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{
            width: '100%', justifyContent: 'center', padding: '12px',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text3)' }}>
          No account?{' '}
          <Link href="/signup" style={{ color: 'var(--cyan)' }}>Sign up free</Link>
        </p>
      </div>

      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text3)' }}>
        No account needed — you can use StudyRev without logging in.
        <br />Progress is saved locally in your browser.
      </p>
    </div>
  )
}
