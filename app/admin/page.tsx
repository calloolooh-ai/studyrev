'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ subjects: 0, topics: 0, questions: 0, notes: 0, users: 0 })

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/')
  }, [user, isAdmin, loading])

  useEffect(() => {
    if (!isAdmin) return
    async function loadStats() {
      const [s, t, q, n, u] = await Promise.all([
        supabase.from('subjects').select('id', { count: 'exact' }),
        supabase.from('topics').select('id', { count: 'exact' }),
        supabase.from('questions').select('id', { count: 'exact' }),
        supabase.from('notes').select('id', { count: 'exact' }),
        supabase.from('user_profiles').select('id', { count: 'exact' }),
      ])
      setStats({
        subjects: s.count || 0,
        topics: t.count || 0,
        questions: q.count || 0,
        notes: n.count || 0,
        users: u.count || 0,
      })
    }
    loadStats()
  }, [isAdmin])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
      Loading...
    </div>
  )
  if (!isAdmin) return null

  const cards = [
    { href: '/admin/subjects', label: 'Subjects', count: stats.subjects, icon: '📚', color: 'var(--cyan)', desc: 'Add or edit subjects' },
    { href: '/admin/topics', label: 'Topics', count: stats.topics, icon: '📑', color: 'var(--green)', desc: 'Manage topics per subject' },
    { href: '/admin/questions', label: 'Questions', count: stats.questions, icon: '✏️', color: 'var(--amber)', desc: 'Add & edit exam questions' },
    { href: '/admin/notes', label: 'Notes', count: stats.notes, icon: '📖', color: 'var(--purple)', desc: 'Write topic notes' },
  ]

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div className="badge badge-amber" style={{ marginBottom: '12px' }}>⚙ Admin Dashboard</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '8px' }}>
          Content Management
        </h1>
        <p style={{ color: 'var(--text2)' }}>
          {stats.users} registered student{stats.users !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px', marginBottom: '40px',
      }}>
        {cards.map(c => (
          <Link key={c.href} href={c.href}>
            <div className="card clickable" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: c.color,
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>{c.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: c.color,
                }}>{c.count}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '4px' }}>{c.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{c.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick add */}
      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '16px' }}>
          Quick actions
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/admin/questions" className="btn btn-primary">+ Add question</Link>
          <Link href="/admin/notes" className="btn btn-ghost">+ Add notes</Link>
          <Link href="/admin/topics" className="btn btn-ghost">+ Add topic</Link>
          <Link href="/admin/subjects" className="btn btn-ghost">+ Add subject</Link>
        </div>
      </div>
    </div>
  )
}
