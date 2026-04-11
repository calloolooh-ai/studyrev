'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCompletedTopics, toggleTopicComplete, getBookmarkedTopics, toggleBookmarkTopic } from '@/lib/storage'

export default function TopicList({ topics, subjectName }: { topics: any[]; subjectName: string }) {
  const [completed, setCompleted] = useState<string[]>([])
  const [bookmarked, setBookmarked] = useState<string[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    getCompletedTopics().then(setCompleted)
    getBookmarkedTopics().then(setBookmarked)
  }, [topics])

  const filtered = topics.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const donePct = topics.length > 0
    ? Math.round((completed.filter(id => topics.some(t => t.id === id)).length / topics.length) * 100)
    : 0

  async function handleComplete(e: React.MouseEvent, topicId: string) {
    e.preventDefault()
    e.stopPropagation()
    const nowDone = await toggleTopicComplete(topicId)
    setCompleted(nowDone
      ? [...completed, topicId]
      : completed.filter(id => id !== topicId)
    )
  }

  async function handleBookmark(e: React.MouseEvent, topicId: string) {
    e.preventDefault()
    e.stopPropagation()
    const nowBookmarked = await toggleBookmarkTopic(topicId)
    setBookmarked(nowBookmarked
      ? [...bookmarked, topicId]
      : bookmarked.filter(id => id !== topicId)
    )
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            Subject progress
          </span>
          <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
            {donePct}%
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${donePct}%` }} />
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Filter topics..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Topic list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((topic, i) => {
          const isDone = completed.includes(topic.id)
          const isSaved = bookmarked.includes(topic.id)
          return (
            <Link key={topic.id} href={`/topic/${topic.id}`}>
              <div className="card clickable" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 20px',
                opacity: isDone ? 0.75 : 1,
                animation: `fadeIn 0.2s ease ${i * 0.04}s both`,
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text3)', minWidth: '24px' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{
                  flex: 1, fontWeight: 500, fontSize: '15px',
                  textDecoration: isDone ? 'line-through' : 'none',
                  color: isDone ? 'var(--text3)' : 'var(--text)',
                }}>
                  {topic.name}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={e => handleBookmark(e, topic.id)}
                    title={isSaved ? 'Remove bookmark' : 'Bookmark'}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '16px', padding: '2px 4px',
                      opacity: isSaved ? 1 : 0.3, transition: 'opacity 0.15s',
                      color: 'var(--amber)',
                    }}
                  >
                    {isSaved ? '★' : '☆'}
                  </button>
                  <button
                    onClick={e => handleComplete(e, topic.id)}
                    title={isDone ? 'Mark incomplete' : 'Mark complete'}
                    style={{
                      background: isDone ? 'var(--green-dim)' : 'transparent',
                      border: `1px solid ${isDone ? 'rgba(0,255,157,0.3)' : 'var(--border2)'}`,
                      borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                      padding: '4px 10px',
                      color: isDone ? 'var(--green)' : 'var(--text3)',
                      fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
                    }}
                  >
                    {isDone ? '✓ done' : 'mark done'}
                  </button>
                  <span style={{ color: 'var(--text3)', fontSize: '14px' }}>→</span>
                </div>
              </div>
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            No topics match "{search}"
          </div>
        )}
      </div>
    </div>
  )
}