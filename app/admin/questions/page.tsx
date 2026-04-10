'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminQuestionsPage() {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()
  const [subjects, setSubjects] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const blank = { topic_id: '', question_text: '', answer_text: '', marks: '', difficulty: 'medium' }
  const [form, setForm] = useState(blank)

  useEffect(() => { if (!loading && !isAdmin) router.push('/') }, [isAdmin, loading])

  useEffect(() => {
    if (!isAdmin) return
    supabase.from('subjects').select('*').order('name').then(({ data }) => setSubjects(data || []))
    supabase.from('topics').select('*, subjects(name, display_name)').order('name').then(({ data }) => setTopics(data || []))
    loadQuestions()
  }, [isAdmin])

  async function loadQuestions() {
    const { data } = await supabase
      .from('questions')
      .select('*, topics(name, subject_id, subjects(name, display_name))')
      .order('created_at', { ascending: false })
    setQuestions(data || [])
    setFiltered(data || [])
  }

  useEffect(() => {
    let q = questions
    if (selectedSubject) q = q.filter((x: any) => x.topics?.subject_id === selectedSubject)
    if (selectedTopic) q = q.filter((x: any) => x.topic_id === selectedTopic)
    if (search) q = q.filter((x: any) => x.question_text.toLowerCase().includes(search.toLowerCase()))
    setFiltered(q)
  }, [selectedSubject, selectedTopic, search, questions])

  const filteredTopics = selectedSubject ? topics.filter(t => t.subject_id === selectedSubject) : topics

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      topic_id: form.topic_id,
      question_text: form.question_text,
      answer_text: form.answer_text || null,
      marks: form.marks ? parseInt(form.marks as string) : null,
      difficulty: form.difficulty || null,
    }
    if (editing) {
      await supabase.from('questions').update(payload).eq('id', editing.id)
      setMsg('Question updated')
    } else {
      await supabase.from('questions').insert(payload)
      setMsg('Question added')
    }
    setForm(blank)
    setEditing(null)
    setSaving(false)
    loadQuestions()
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this question?')) return
    await supabase.from('questions').delete().eq('id', id)
    loadQuestions()
  }

  function startEdit(q: any) {
    setEditing(q)
    setForm({
      topic_id: q.topic_id,
      question_text: q.question_text,
      answer_text: q.answer_text || '',
      marks: q.marks?.toString() || '',
      difficulty: q.difficulty || 'medium',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading || !isAdmin) return null

  return (
    <div className="container" style={{ paddingTop: '32px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Link href="/admin" style={{ color: 'var(--text3)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>← Admin</Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Questions</h1>
        <span className="badge badge-amber">{filtered.length}</span>
      </div>

      {/* Form */}
      <div className="card" style={{ marginBottom: '28px', borderColor: editing ? 'rgba(255,184,0,0.3)' : 'var(--border)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '16px' }}>
          {editing ? '✏️ Edit question' : '+ Add question'}
        </h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <select
            value={form.topic_id}
            onChange={e => setForm(f => ({ ...f, topic_id: e.target.value }))}
            required
            style={{
              width: '100%', padding: '10px 14px', background: 'var(--bg2)',
              border: '1px solid var(--border2)', borderRadius: '8px',
              color: 'var(--text)', fontSize: '14px',
            }}
          >
            <option value="">Select topic…</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>
                {t.subjects?.display_name || t.subjects?.name} — {t.name}
              </option>
            ))}
          </select>

          <textarea
            value={form.question_text}
            onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))}
            placeholder="Question text…"
            required
            style={{ minHeight: '80px' }}
          />

          <textarea
            value={form.answer_text}
            onChange={e => setForm(f => ({ ...f, answer_text: e.target.value }))}
            placeholder="Answer / mark scheme (markdown supported)…"
            style={{ minHeight: '100px' }}
          />

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={form.marks}
              onChange={e => setForm(f => ({ ...f, marks: e.target.value }))}
              placeholder="Marks (e.g. 3)"
              style={{ width: '140px' }}
            />
            <select
              value={form.difficulty}
              onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
              style={{
                padding: '10px 14px', background: 'var(--bg2)',
                border: '1px solid var(--border2)', borderRadius: '8px',
                color: 'var(--text)', fontSize: '14px',
              }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update question' : 'Add question'}
            </button>
            {editing && (
              <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(blank) }}>
                Cancel
              </button>
            )}
            {msg && <span style={{ fontSize: '13px', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>✓ {msg}</span>}
          </div>
        </form>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select
          value={selectedSubject}
          onChange={e => { setSelectedSubject(e.target.value); setSelectedTopic('') }}
          style={{
            padding: '8px 12px', background: 'var(--bg2)',
            border: '1px solid var(--border2)', borderRadius: '8px',
            color: 'var(--text)', fontSize: '13px',
          }}
        >
          <option value="">All subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.display_name || s.name}</option>)}
        </select>
        <select
          value={selectedTopic}
          onChange={e => setSelectedTopic(e.target.value)}
          style={{
            padding: '8px 12px', background: 'var(--bg2)',
            border: '1px solid var(--border2)', borderRadius: '8px',
            color: 'var(--text)', fontSize: '13px',
          }}
        >
          <option value="">All topics</option>
          {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions…"
          style={{ flex: 1, minWidth: '200px' }}
        />
      </div>

      {/* Question list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((q: any) => (
          <div key={q.id} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                  {q.topics?.subjects?.display_name || q.topics?.subjects?.name} · {q.topics?.name}
                  {q.marks && <span className="badge badge-amber" style={{ marginLeft: '8px' }}>{q.marks}m</span>}
                  {q.difficulty && (
                    <span className={`badge ${q.difficulty === 'easy' ? 'badge-green' : q.difficulty === 'hard' ? 'badge-red' : 'badge-cyan'}`} style={{ marginLeft: '6px' }}>
                      {q.difficulty}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text)' }}>
                  {q.question_text.length > 120 ? q.question_text.slice(0, 120) + '…' : q.question_text}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => startEdit(q)} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(q.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Del
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            No questions found
          </div>
        )}
      </div>
    </div>
  )
}
