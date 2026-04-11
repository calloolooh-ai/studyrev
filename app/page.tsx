import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import ProgressBadge from '@/components/ProgressBadge'

const SUBJECT_META: Record<string, { icon: string; color: string; desc: string }> = {
  cs:      { icon: '💻', color: '#00d4ff', desc: 'Data structures, algorithms, networks & more' },
  math:    { icon: '∑',  color: '#00ff9d', desc: 'Algebra, calculus, statistics and proof' },
  physics: { icon: '⚡', color: '#ffb800', desc: 'Mechanics, waves, electricity and beyond' },
  biology: { icon: '🧬', color: '#a78bfa', desc: 'Cells, genetics, ecosystems and more' },
  chemistry: { icon: '⚗️', color: '#ff4d6a', desc: 'Atoms, reactions, organic compounds' },
}

const COMING_SOON = [
  { name: 'physics', display_name: 'Physics (0625)',     icon: '⚡', color: '#ffb800', desc: 'Mechanics, waves, electricity and nuclear physics' },
  { name: 'math',    display_name: 'Mathematics (0580)', icon: '∑',  color: '#00ff9d', desc: 'Number, algebra, geometry, statistics and more' },
]

export const revalidate = 60

async function getSubjects() {
  const { data } = await supabase.from('subjects').select('*').order('name')
  return data || []
}

export default async function HomePage() {
  const subjects = await getSubjects()

  // Filter out subjects that are in COMING_SOON from the live list
  // (once they are added to Supabase they become live automatically)
  const comingSoonNames = COMING_SOON.map(s => s.name)
  const liveSubjects = subjects.filter((s: any) => !comingSoonNames.includes(s.name))
  const stillComingSoon = COMING_SOON.filter(s => !subjects.some((live: any) => live.name === s.name))

  return (
    <div className="container" style={{ paddingTop: '60px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--cyan-dim)', border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: '20px', padding: '6px 16px', marginBottom: '24px',
          fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)',
        }}>
          Fast. Focused. Exam-ready.
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
          fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em',
        }}>
          Revision that<br />
          <span style={{ color: 'var(--cyan)' }} className="glow-text">actually works</span>
        </h1>

        <p style={{ color: 'var(--text2)', maxWidth: '480px', margin: '0 auto 32px', fontSize: '16px' }}>
          Structured notes, practice questions, and timed quizzes — all in one clean workspace.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['📖 Notes', '✏️ Practice', '⏱ Quizzes', '📄 Past Papers', '🔖 Bookmarks'].map(f => (
            <span key={f} className="badge badge-cyan">{f}</span>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          color: 'var(--text2)', marginBottom: '20px', letterSpacing: '0.05em',
          textTransform: 'uppercase', fontSize: '12px', fontWeight: 600,
          fontFamily: 'var(--font-mono)',
        }}>
          Choose a subject
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {/* Live subjects from Supabase */}
          {liveSubjects.map((s: any) => {
            const meta = SUBJECT_META[s.name] || { icon: '📚', color: 'var(--cyan)', desc: '' }
            return (
              <Link key={s.id} href={'/subject/' + s.name}>
                <div className="card clickable" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '3px', background: s.color || meta.color,
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{s.icon || meta.icon}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text3)' }}>→</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text)' }}>
                    {s.display_name || s.name.toUpperCase()}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px', minHeight: '36px' }}>
                    {s.description || meta.desc}
                  </p>
                  <ProgressBadge subjectId={s.id} subjectName={s.name} color={s.color || meta.color} />
                </div>
              </Link>
            )
          })}

          {/* Coming soon cards */}
          {stillComingSoon.map(s => (
            <div key={s.name} className="card" style={{
              position: 'relative', overflow: 'hidden',
              opacity: 0.55, cursor: 'not-allowed',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '3px', background: s.color,
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '28px' }}>{s.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  background: 'var(--amber-dim)', color: 'var(--amber)',
                  border: '1px solid rgba(255,184,0,0.3)',
                  borderRadius: '10px', padding: '2px 8px',
                }}>Coming soon</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text)' }}>
                {s.display_name}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text3)', minHeight: '36px' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {liveSubjects.length === 0 && stillComingSoon.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              No subjects yet. Run the seed SQL in Supabase to get started.
            </p>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div style={{
        marginTop: '60px', padding: '24px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', display: 'flex',
        gap: '32px', flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {[
          { label: 'Live subjects', value: liveSubjects.length },
          { label: 'Coming soon', value: stillComingSoon.length },
          { label: 'Study modes', value: '4' },
          { label: 'No login needed', value: '✓' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--cyan)' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}