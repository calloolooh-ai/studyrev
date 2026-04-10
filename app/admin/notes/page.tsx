'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminNotesPage() {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()
  const [topics, setTopics] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const blank = { topic_id: '', title: '', content: '' }
  const [form, setForm] = useState(blank)

  useEffect(() => { if (!loading && !isAdmin) router.push('/') }, [isAdmin, loading])

  useEffect(() => {
    if (!isAdmin) return
    supabase.from('topics').select('*, subjects(name, display_name)').order('name').then(({ data }) => setTopics(data || []))
    loadNotes()
  }, [isAdmin])

  async function loadNotes() {
    const { data } = await supabase
      .from('notes')
      .select('*, topics(name, subjects(name, display_name))')
      .order('created_at', { ascending: false })
    setNotes(data || [])
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      topic_id: form.topic_id,
      title: form.title || null,
      content: form.content,
    }
    if (editing) {
      await supabase.from('notes').update(payload).eq('id', editing.id)
      setMsg('Note updated')
    } else {
      await supabase.from('notes').insert(payload)
      setMsg('Note added')
    }
    setForm(blank)
    setEditing(null)
    setSaving(false)
    loadNotes()
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this note?')) return
    await supabase.from('notes').delete().eq('id', id)
    loadNotes()
  }

  function startEdit(n: any) {
    setEditing(n)
    setForm({ topic_id: n.topic_id, title: n.title || '', content: n.content })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading || !isAdmin) return null

  return (
    <div className="container" style={{ paddingTop: '32px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Link href="/admin" style={{ color: 'var(--text3)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>← Admin</Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Notes</h1>
        <span className="badge badge-purple">{notes.length}</span>
      </div>

      {/* Form */}
      <div className="card" style={{ marginBottom: '28px', borderColor: editing ? 'rgba(167,139,250,0.3)' : 'var(--border)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '16px' }}>
          {editing ? '✏️ Edit note' : '+ Add note'}
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

          <input
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Note title (optional)…"
          />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                Content (Markdown supported)
              </span>
              <button type="button" onClick={() => setPreview(preview ? null : form.content)}
                style={{ fontSize: '12px', background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer' }}>
                {preview ? 'Edit' : 'Preview'}
              </button>
            </div>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="## Section heading&#10;&#10;Notes content here...&#10;&#10;**Bold**, *italic*, `code`"
              required
              style={{ minHeight: '240px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update note' : 'Add note'}
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

      {/* Notes list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notes.map((n: any) => (
          <div key={n.id} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                  {n.topics?.subjects?.display_name || n.topics?.subjects?.name} · {n.topics?.name}
                </div>
                <div style={{ fontWeight: 600, marginBottom: '4px', color: n.title ? 'var(--text)' : 'var(--text3)' }}>
                  {n.title || '(untitled)'}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                  {n.content.slice(0, 80)}…
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => startEdit(n)} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(n.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Del
                </button>
              </div>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            No notes yet
          </div>
        )}
      </div>
    </div>
  )
}
