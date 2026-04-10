'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminTopicsPage() {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()
  const [subjects, setSubjects] = useState<any[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const blank = { subject_id: '', name: '', order_index: '0' }
  const [form, setForm] = useState(blank)

  useEffect(() => { if (!loading && !isAdmin) router.push('/') }, [isAdmin, loading])
  useEffect(() => {
    if (!isAdmin) return
    supabase.from('subjects').select('*').order('name').then(({ data }) => setSubjects(data || []))
    loadTopics()
  }, [isAdmin])

  async function loadTopics() {
    const { data } = await supabase
      .from('topics')
      .select('*, subjects(name, display_name)')
      .order('order_index')
    setTopics(data || [])
  }

  const filtered = selectedSubject ? topics.filter(t => t.subject_id === selectedSubject) : topics

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      subject_id: form.subject_id,
      name: form.name,
      order_index: parseInt(form.order_index) || 0,
    }
    if (editing) {
      await supabase.from('topics').update(payload).eq('id', editing.id)
      setMsg('Topic updated')
    } else {
      await supabase.from('topics').insert(payload)
      setMsg('Topic added')
    }
    setForm(blank)
    setEditing(null)
    setSaving(false)
    loadTopics()
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete topic and all its questions and notes?')) return
    await supabase.from('topics').delete().eq('id', id)
    loadTopics()
  }

  if (loading || !isAdmin) return null

  return (
    <div className="container" style={{ paddingTop: '32px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
        <Link href="/admin" style={{ color: 'var(--text3)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>← Admin</Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Topics</h1>
        <span className="badge badge-green">{filtered.length}</span>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '16px' }}>
          {editing ? '✏️ Edit topic' : '+ Add topic'}
        </h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <select
            value={form.subject_id}
            onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
            required
            style={{ width: '100%', padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '8px', color: 'var(--text)', fontSize: '14px' }}
          >
            <option value="">Select subject…</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.display_name || s.name}</option>)}
          </select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Topic name…" required />
            <input type="text" value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: e.target.value }))} placeholder="Order" style={{ width: '80px' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update' : 'Add topic'}
            </button>
            {editing && <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(blank) }}>Cancel</button>}
            {msg && <span style={{ fontSize: '13px', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>✓ {msg}</span>}
          </div>
        </form>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px' }}>
          <option value="">All subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.display_name || s.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((t: any) => (
          <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px' }}>
            <div>
              <div style={{ fontWeight: 500 }}>{t.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                {t.subjects?.display_name || t.subjects?.name} · order {t.order_index}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => { setEditing(t); setForm({ subject_id: t.subject_id, name: t.name, order_index: t.order_index?.toString() || '0' }) }}
                className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>Edit</button>
              <button onClick={() => handleDelete(t.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
