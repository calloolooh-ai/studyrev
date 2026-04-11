'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'

const ALL_SUBJECTS = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'cs',      label: 'Computer Science (0478)', color: '#00d4ff', available: true },
  { id: '00000000-0000-0000-0000-000000000002', name: 'physics', label: 'Physics (0625)',           color: '#ffb800', available: true },
  { id: '00000000-0000-0000-0000-000000000003', name: 'math',    label: 'Mathematics (0580)',       color: '#00ff9d', available: true },
]

const COMING_SOON_SUBJECTS = [
  { id: null, name: 'bio',  label: 'Biology (0610)',   color: '#a78bfa', available: false },
  { id: null, name: 'chem', label: 'Chemistry (0620)', color: '#ff4d6a', available: false },
]

export default function PastPapersPage() {
  const [availableSubjects, setAvailableSubjects] = useState<typeof ALL_SUBJECTS>([])
  const [subjectId, setSubjectId] = useState('')
  const [topics, setTopics] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [paper, setPaper] = useState<'All' | 'Paper 1' | 'Paper 2'>('All')
  const [topicId, setTopicId] = useState('All')
  const [year, setYear] = useState('All')
  const [search, setSearch] = useState('')
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  // Check which subjects actually exist in DB
  useEffect(() => {
    supabase.from('subjects').select('id, name').then(({ data }) => {
      const dbIds = (data || []).map((s: any) => s.id)
      const live = ALL_SUBJECTS.filter(s => dbIds.includes(s.id))
      setAvailableSubjects(live)
      if (live.length > 0) setSubjectId(live[0].id)
    })
  }, [])

  useEffect(() => {
    if (!subjectId) return
    async function load() {
      setLoading(true)
      setTopicId('All'); setPaper('All'); setYear('All'); setSearch(''); setRevealed({})

      const { data: topicData } = await supabase
        .from('topics').select('id, name, order_index')
        .eq('subject_id', subjectId).order('order_index')

      const topicIds = (topicData || []).map((t: any) => t.id)

      const { data: qData } = await supabase
        .from('questions').select('*, topics(name, order_index)')
        .in('topic_id', topicIds.length > 0 ? topicIds : ['none'])
        .not('paper', 'is', null)
        .order('created_at', { ascending: true })

      setTopics(topicData || [])
      setQuestions(qData || [])
      setFiltered(qData || [])
      setLoading(false)
    }
    load()
  }, [subjectId])

  useEffect(() => {
    let q = questions
    if (paper !== 'All') q = q.filter((x: any) => x.paper === paper)
    if (topicId !== 'All') q = q.filter((x: any) => x.topic_id === topicId)
    if (year !== 'All') q = q.filter((x: any) => x.year === year)
    if (search.trim()) q = q.filter((x: any) => x.question_text.toLowerCase().includes(search.toLowerCase()))
    setFiltered(q)
    setRevealed({})
  }, [paper, topicId, year, search, questions])

  const years = Array.from(new Set(questions.map((q: any) => q.year).filter(Boolean))).sort().reverse()
  const p1count = questions.filter((q: any) => q.paper === 'Paper 1').length
  const p2count = questions.filter((q: any) => q.paper === 'Paper 2').length
  const currentSubject = ALL_SUBJECTS.find(s => s.id === subjectId)

  const selectStyle = {
    padding: '8px 12px', background: 'var(--bg2)',
    border: '1px solid var(--border2)', borderRadius: '8px',
    color: 'var(--text)', fontSize: '13px', cursor: 'pointer',
  }

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">IGCSE</span>
          <span className="badge badge-amber">Past Paper Practice</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '8px' }}>
          Past Paper Questions
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
          Real exam questions with full mark scheme answers. Filter by subject, paper and topic.
        </p>
      </div>

      {/* Subject selector */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Select subject
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {availableSubjects.map(s => (
            <button key={s.id} onClick={() => setSubjectId(s.id)} style={{
              padding: '10px 18px', borderRadius: '10px', fontSize: '14px',
              border: '1px solid ' + (subjectId === s.id ? s.color : 'var(--border2)'),
              background: subjectId === s.id ? s.color + '20' : 'var(--surface)',
              color: subjectId === s.id ? s.color : 'var(--text2)',
              cursor: 'pointer', fontWeight: subjectId === s.id ? 600 : 400,
              fontFamily: 'var(--font-body)', transition: 'all 0.15s',
            }}>
              {s.label}
            </button>
          ))}
          {COMING_SOON_SUBJECTS.map(s => (
            <button key={s.name} disabled style={{
              padding: '10px 18px', borderRadius: '10px', fontSize: '14px',
              border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text3)',
              cursor: 'not-allowed', opacity: 0.55, fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              {s.label}
              <span style={{
                fontSize: '10px', background: 'var(--amber-dim)', color: 'var(--amber)',
                border: '1px solid rgba(255,184,0,0.3)', borderRadius: '8px', padding: '1px 6px',
              }}>Soon</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { label: 'Paper 1', value: p1count, color: currentSubject?.color || 'var(--cyan)' },
          { label: 'Paper 2', value: p2count, color: 'var(--amber)' },
          { label: 'Showing', value: filtered.length, color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Paper tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {(['All', 'Paper 1', 'Paper 2'] as const).map(p => (
          <button key={p} onClick={() => setPaper(p)} style={{
            padding: '8px 18px', borderRadius: '8px', fontSize: '14px',
            border: '1px solid ' + (paper === p ? (currentSubject?.color || 'var(--cyan)') : 'var(--border2)'),
            background: paper === p ? (currentSubject?.color || 'var(--cyan)') + '20' : 'transparent',
            color: paper === p ? (currentSubject?.color || 'var(--cyan)') : 'var(--text2)',
            cursor: 'pointer', fontWeight: paper === p ? 600 : 400, fontFamily: 'var(--font-body)',
          }}>
            {p}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select value={topicId} onChange={e => setTopicId(e.target.value)} style={selectStyle}>
          <option value="All">All topics</option>
          {topics
            .filter(t => paper === 'All' || (paper === 'Paper 1' ? t.order_index <= 6 : t.order_index >= 7))
            .map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {years.length > 0 && (
          <select value={year} onChange={e => setYear(e.target.value)} style={selectStyle}>
            <option value="All">All years</option>
            {years.map((y: any) => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        <input
          type="text" placeholder="Search questions..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
      </div>

      {/* Questions */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          Loading questions...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>No questions match your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((q: any, i: number) => (
            <div key={q.id} className="card" style={{ animation: 'fadeIn 0.2s ease ' + (i * 0.02) + 's both' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className={'badge ' + (q.paper === 'Paper 1' ? 'badge-cyan' : 'badge-amber')}>{q.paper}</span>
                {q.topics?.name && (
                  <span style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{q.topics.name}</span>
                )}
                {q.year && q.session && (
                  <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                    {q.session} {q.year}
                  </span>
                )}
                {q.marks && <span className="badge badge-green">{q.marks}m</span>}
                {q.difficulty && (
                  <span className={'badge ' + (q.difficulty === 'easy' ? 'badge-green' : q.difficulty === 'hard' ? 'badge-red' : 'badge-cyan')}>
                    {q.difficulty}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '16px', color: 'var(--text)' }}>
                {q.question_text}
              </p>

              {revealed[q.id] ? (
                <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(0,255,157,0.2)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'var(--font-mono)', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Mark Scheme Answer
                  </div>
                  <div className="markdown">
                    <ReactMarkdown>{q.answer_text || 'No answer provided.'}</ReactMarkdown>
                  </div>
                  <button onClick={() => setRevealed(r => ({ ...r, [q.id]: false }))}
                    style={{ marginTop: '12px', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    Hide answer
                  </button>
                </div>
              ) : (
                <button className="btn btn-ghost" onClick={() => setRevealed(r => ({ ...r, [q.id]: true }))}
                  style={{ alignSelf: 'flex-start' }}>
                  Show mark scheme
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}