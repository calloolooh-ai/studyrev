'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'

const SUBJECT_ID = '00000000-0000-0000-0000-000000000001'

export default function PastPapersPage() {
  const [topics, setTopics] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [paper, setPaper] = useState<'All' | 'Paper 1' | 'Paper 2'>('All')
  const [topicId, setTopicId] = useState('All')
  const [year, setYear] = useState('All')
  const [search, setSearch] = useState('')
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: t }, { data: q }] = await Promise.all([
        supabase.from('topics').select('id, name, order_index')
          .eq('subject_id', SUBJECT_ID).order('order_index'),
        supabase.from('questions').select('*, topics(name, order_index)')
          .in('topic_id', (await supabase.from('topics').select('id').eq('subject_id', SUBJECT_ID)).data?.map((x: any) => x.id) || [])
          .not('paper', 'is', null)
          .order('created_at', { ascending: true }),
      ])
      setTopics(t || [])
      setQuestions(q || [])
      setFiltered(q || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let q = questions
    if (paper !== 'All') q = q.filter((x: any) => x.paper === paper)
    if (topicId !== 'All') q = q.filter((x: any) => x.topic_id === topicId)
    if (year !== 'All') q = q.filter((x: any) => x.year === year)
    if (search.trim()) q = q.filter((x: any) =>
      x.question_text.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(q)
    setRevealed({})
  }, [paper, topicId, year, search, questions])

  const years = [...new Set(questions.map((q: any) => q.year).filter(Boolean))].sort().reverse()

  const p1count = questions.filter((q: any) => q.paper === 'Paper 1').length
  const p2count = questions.filter((q: any) => q.paper === 'Paper 2').length

  const selectStyle = {
    padding: '8px 12px',
    background: 'var(--bg2)',
    border: '1px solid var(--border2)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '13px',
    cursor: 'pointer',
  }

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">Computer Science 0478</span>
          <span className="badge badge-amber">Past Paper Practice</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '8px' }}>
          Past Paper Questions
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
          Real exam questions from 0478 past papers with full mark scheme answers.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--cyan)' }}>{p1count}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Paper 1 Qs</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--amber)' }}>{p2count}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Paper 2 Qs</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)' }}>{filtered.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Showing</div>
          </div>
        </div>
      </div>

      {/* Paper selector tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['All', 'Paper 1', 'Paper 2'] as const).map(p => (
          <button key={p} onClick={() => setPaper(p)} style={{
            padding: '8px 20px',
            borderRadius: '8px',
            border: '1px solid ' + (paper === p ? 'var(--cyan)' : 'var(--border2)'),
            background: paper === p ? 'var(--cyan-dim)' : 'transparent',
            color: paper === p ? 'var(--cyan)' : 'var(--text2)',
            cursor: 'pointer',
            fontWeight: paper === p ? 600 : 400,
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
          }}>
            {p}
            {p === 'Paper 1' && (
              <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--text3)' }}>Topics 1-6</span>
            )}
            {p === 'Paper 2' && (
              <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--text3)' }}>Topics 7-10</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select value={topicId} onChange={e => setTopicId(e.target.value)} style={selectStyle}>
          <option value="All">All topics</option>
          {topics
            .filter(t => paper === 'All' || (paper === 'Paper 1' ? t.order_index <= 6 : t.order_index >= 7))
            .map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
        </select>

        <select value={year} onChange={e => setYear(e.target.value)} style={selectStyle}>
          <option value="All">All years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
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
            <div key={q.id} className="card" style={{
              animation: 'fadeIn 0.2s ease ' + (i * 0.02) + 's both',
            }}>
              {/* Meta row */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className={'badge ' + (q.paper === 'Paper 1' ? 'badge-cyan' : 'badge-amber')}>
                  {q.paper}
                </span>
                {q.topics?.name && (
                  <span style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                    {q.topics.name}
                  </span>
                )}
                {q.year && q.session && (
                  <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                    {q.session} {q.year}
                  </span>
                )}
                {q.marks && (
                  <span className="badge badge-green">{q.marks}m</span>
                )}
                {q.difficulty && (
                  <span className={'badge ' + (q.difficulty === 'easy' ? 'badge-green' : q.difficulty === 'hard' ? 'badge-red' : 'badge-cyan')}>
                    {q.difficulty}
                  </span>
                )}
              </div>

              {/* Question */}
              <p style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '16px', color: 'var(--text)' }}>
                {q.question_text}
              </p>

              {/* Answer toggle */}
              {revealed[q.id] ? (
                <div style={{
                  background: 'var(--green-dim)',
                  border: '1px solid rgba(0,255,157,0.2)',
                  borderRadius: '8px',
                  padding: '16px',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'var(--font-mono)', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Mark Scheme Answer
                  </div>
                  <div className="markdown">
                    <ReactMarkdown>{q.answer_text || 'No answer provided.'}</ReactMarkdown>
                  </div>
                  <button
                    onClick={() => setRevealed(r => ({ ...r, [q.id]: false }))}
                    style={{ marginTop: '12px', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                  >
                    Hide answer
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-ghost"
                  onClick={() => setRevealed(r => ({ ...r, [q.id]: true }))}
                  style={{ alignSelf: 'flex-start' }}
                >
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
