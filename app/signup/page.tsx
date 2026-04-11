'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      })

      if (error) { setError(error.message); setLoading(false); return }

      if (data.user) {
        await supabase.from('user_profiles').upsert({
          id: data.user.id,
          email,
          display_name: displayName || null,
          is_admin: false,
        })
        if (data.session) {
          router.push('/')
          router.refresh()
        } else {
          setDone(true)
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="container" style={{ paddingTop: '80px', maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '12px' }}>
          Check your email
        </h1>
        <p style={{ color: 'var(--text2)', marginBottom: '24px', lineHeight: 1.6 }}>
          We sent a confirmation link to {email}. Click it to activate your account.
        </p>
        <Link href="/login" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          Back to login
        </Link>
      </div>
    )
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
          Create an account
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
          Sync progress, bookmarks and notes across all your devices
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '6px', fontWeight: 500 }}>
              Display name (optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Alex"
            />
          </div>
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
              Password (min 6 chars)
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

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text3)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--cyan)' }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}