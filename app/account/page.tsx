'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { getQuizHistory, QuizResult } from '@/lib/storage'
import Link from 'next/link'

export default function AccountPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([])
  const [stats, setStats] = useState({ bookmarks: 0, completed: 0, quizzes: 0 })

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name || '')
  }, [profile])

  useEffect(() => {
    if (!user) return
    async function loadData() {
      const [bq, bt, prog, hist] = await Promise.all([
        supabase.from('user_bookmarks').select('id', { count: 'exact' }).eq('user_id', user!.id).eq('item_type', 'question'),
        supabase.from('user_bookmarks').select('id', { count: 'exact' }).eq('user_id', user!.id).eq('item_type', 'topic'),
        supabase.from('user_progress').select('id', { count: 'exact' }).eq('user_id', user!.id).eq('completed', true),
        supabase.from('user_quiz_results').select('id', { count: 'exact' }).eq('user_id', user!.id),
      ])
      setStats({
        bookmarks: (bq.count || 0) + (bt.count || 0),
        completed: prog.count || 0,
        quizzes: hist.count || 0,
      })
      const history = await getQuizHistory()
      setQuizHistory(history.slice(0, 10))
    }
    loadData()
  }, [user])

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('user_profiles').update({ display_name: displayName }).eq('id', user!.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
      Loading...
    </div>
  )
  if (!user) return null

  return (
    <div className="container" style={{ paddingTop: '40px', maxWidth: '680px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '6px' }}>
        Account
      </h1>
      <p style={{ color: 'var(--text2)', marginBottom: '32px', fontSize: '14px' }}>
        {user.email}
      </p>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px', marginBottom: '32px',
      }}>
        {[
          { label: 'Bookmarks', value: stats.bookmarks, icon: '★', color: 'var(--amber)' },
          { label: 'Topics done', value: stats.completed, icon: '✓', color: 'var(--green)' },
          { label: 'Quizzes taken', value: stats.quizzes, icon: '⏱', color: 'var(--cyan)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px 12px' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px', color: s.color }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Display name */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '16px' }}>
          Profile
        </h2>
        <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Display name"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ whiteSpace: 'nowrap' }}>
            {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>

      {/* Quiz history */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '16px' }}>
          Recent quiz results
        </h2>
        {quizHistory.length === 0 ? (
          <p style={{ color: 'var(--text3)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
            No quizzes taken yet. Start one on any topic page.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {quizHistory.map((r, i) => {
              const pct = Math.round((r.score / r.total) * 100)
              const color = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--cyan)' : pct >= 40 ? 'var(--amber)' : 'var(--red)'
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: 'var(--bg2)',
                  borderRadius: '8px', border: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
                      {new Date(r.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color, fontSize: '15px' }}>
                      {r.score}/{r.total}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text3)', marginLeft: '8px' }}>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="card" style={{ borderColor: 'rgba(255,77,106,0.2)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '8px', color: 'var(--red)' }}>
          Sign out
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>
          Your progress is saved to your account and will be here when you return.
        </p>
        <button className="btn btn-danger" onClick={async () => {
          await supabase.auth.signOut()
          router.push('/')
        }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
