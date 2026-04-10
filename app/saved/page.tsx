'use client'
import { useEffect, useState } from 'react'
import { getBookmarkedQuestions, getBookmarkedTopics } from '@/lib/storage'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function SavedPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function load() {
      const qIds = getBookmarkedQuestions()
      const tIds = getBookmarkedTopics()

      const [{ data: qs }, { data: ts }] = await Promise.all([
        qIds.length > 0
          ? supabase.from('questions').select('*').in('id', qIds)
          : Promise.resolve({ data: [] }),
        tIds.length > 0
          ? supabase.from('topics').select('*, subjects(*)').in('id', tIds)
          : Promise.resolve({ data: [] }),
      ])

      setQuestions(qs || [])
      setTopics(ts || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '8px' }}>
        🔖 Saved
      </h1>
      <p style={{ color: 'var(--text2)', marginBottom: '36px' }}>
        Your bookmarked topics and questions — stored in your browser.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          Loading...
        </div>
      ) : (
        <>
          {/* Saved Topics */}
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Topics ({topics.length})
            </h2>
            {topics.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text3)', fontSize: '13px' }}>
                No bookmarked topics yet. Star topics on the subject page.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topics.map((t: any) => (
                  <Link key={t.id} href={`/topic/${t.id}`}>
                    <div className="card clickable" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: '2px' }}>{t.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                          {t.subjects?.display_name || t.subjects?.name}
                        </div>
                      </div>
                      <span style={{ color: 'var(--amber)' }}>★</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Saved Questions */}
          <section>
            <h2 style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              Questions ({questions.length})
            </h2>
            {questions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text3)', fontSize: '13px' }}>
                No bookmarked questions yet. Star questions in Practice mode.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {questions.map((q: any) => (
                  <div key={q.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>Question</span>
                      {q.marks && <span className="badge badge-amber">{q.marks}m</span>}
                    </div>
                    <p style={{ fontSize: '15px', marginBottom: '12px' }}>{q.question_text}</p>

                    {revealed[q.id] ? (
                      <div style={{
                        background: 'var(--green-dim)',
                        border: '1px solid rgba(0,255,157,0.2)',
                        borderRadius: 'var(--radius)',
                        padding: '14px',
                        fontSize: '14px',
                        color: 'var(--text)',
                      }}>
                        <div style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'var(--font-mono)', marginBottom: '8px', textTransform: 'uppercase' }}>✓ Answer</div>
                        {q.answer_text || 'No answer provided.'}
                      </div>
                    ) : (
                      <button className="btn btn-ghost" onClick={() => setRevealed(r => ({ ...r, [q.id]: true }))}>
                        Show Answer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
