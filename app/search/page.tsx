'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [allTopics, setAllTopics] = useState<any[]>([])
  const [allQuestions, setAllQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: topics }, { data: questions }] = await Promise.all([
        supabase.from('topics').select('*, subjects(name, display_name)'),
        supabase.from('questions').select('*, topics(name, subject_id, subjects(name, display_name))'),
      ])
      setAllTopics(topics || [])
      setAllQuestions(questions || [])
      setLoading(false)
    }
    load()
  }, [])

  const q = query.trim().toLowerCase()

  const filteredTopics = q
    ? allTopics.filter(t => t.name.toLowerCase().includes(q))
    : []

  const filteredQuestions = q
    ? allQuestions.filter(x =>
        x.question_text.toLowerCase().includes(q) ||
        (x.answer_text || '').toLowerCase().includes(q)
      )
    : []

  const total = filteredTopics.length + filteredQuestions.length

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '24px' }}>
        Search
      </h1>

      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <span style={{
          position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text3)', fontSize: '16px', pointerEvents: 'none',
        }}>🔍</span>
        <input
          type="text"
          autoFocus
          placeholder="Search topics, questions..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ paddingLeft: '40px', fontSize: '16px', padding: '14px 14px 14px 40px' }}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          Loading content...
        </div>
      )}

      {!loading && q && (
        <div style={{ marginBottom: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text3)' }}>
          {total} result{total !== 1 ? 's' : ''} for "{query}"
        </div>
      )}

      {!loading && !q && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            Start typing to search across all topics and questions
          </p>
        </div>
      )}

      {/* Topics results */}
      {filteredTopics.length > 0 && (
        <section style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Topics
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredTopics.map((t: any) => (
              <Link key={t.id} href={`/topic/${t.id}`}>
                <div className="card clickable" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: '3px' }}>
                      <Highlight text={t.name} query={query} />
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                      {t.subjects?.display_name || t.subjects?.name}
                    </div>
                  </div>
                  <span style={{ color: 'var(--cyan)', fontSize: '13px' }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Questions results */}
      {filteredQuestions.length > 0 && (
        <section>
          <h2 style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredQuestions.slice(0, 20).map((q: any) => (
              <Link key={q.id} href={`/topic/${q.topic_id}`}>
                <div className="card clickable" style={{ padding: '14px 20px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                    {q.topics?.subjects?.display_name || q.topics?.subjects?.name} · {q.topics?.name}
                    {q.marks && <span className="badge badge-amber" style={{ marginLeft: '8px' }}>{q.marks}m</span>}
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: 1.5 }}>
                    <Highlight text={q.question_text} query={query} />
                  </p>
                </div>
              </Link>
            ))}
            {filteredQuestions.length > 20 && (
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                +{filteredQuestions.length - 20} more results — refine your search
              </p>
            )}
          </div>
        </section>
      )}

      {!loading && q && total === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤷</div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            No results for "{query}"
          </p>
        </div>
      )}
    </div>
  )
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)', borderRadius: '3px', padding: '0 2px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}
