'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminSubjectsPage() {
  const { isAdmin, loading } = useAuth()
  const router = useRouter()
  const [subjects, setSubjects] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const blank = { name: '', display_name: '', description: '', icon: '📚', color: '#00d4ff' }
  const [form, setForm] = useState(blank)

  useEffect(() => { if (!loading && !isAdmin) router.push('/') }, [isAdmin, loading])

  useEffect(() => {
    if (isAdmin) loadSubjects()
  }, [isAdmin])

  async function loadSubjects() {
    const { data } = await supabase.from('subjects').select('*').order('name')
    setSubjects(data || [])
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (editing) {
      await supabase.from('subjects').update(form).eq('id', editing.id)
      setMsg('Subject updated')
    } else {
      await supabase.from('subjects').insert(form)
      setMsg('Subject added')
    }
    setForm(blank)
    setEditing(null)
    setSaving(false)
    loadSubjects()
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete subject and ALL its topics, questions, and notes?')) return
    await supabase.from('subjects').delete().eq('id', id)
    loadSubjects()
  }

  if (loading || !isAdmin) return null

  const field = (label: string, key: string, placeholder: string, type = 'text') => (
    <div>
      <label style={{ display: 'block', fontSize: '13px', color: 'var(--text2)', marginBottom: '4px' }}>{label}</label>
      <input type={type} value={(form as any)[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder} required={key === 'name'} />
    </div>
  )

  return (
    <div className="container" style={{ paddingTop: '32px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
        <Link href="/admin" style={{ color: 'var(--text3)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>← Admin</Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Subjects</h1>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '16px' }}>
          {editing ? '✏️ Edit subject' : '+ Add subject'}
        </h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {field('Slug (e.g. "math")', 'name', 'math')}
            {field('Display name', 'display_name', 'Mathematics (0580)')}
          </div>
          {field('Description', 'description', 'Short description for students')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {field('Icon (emoji)', 'icon', '📚')}
            {field('Colour (hex)', 'color', '#00d4ff')}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update' : 'Add subject'}
            </button>
            {editing && <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(blank) }}>Cancel</button>}
            {msg && <span style={{ fontSize: '13px', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>✓ {msg}</span>}
          </div>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {subjects.map((s: any) => (
          <div key={s.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{s.display_name || s.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{s.name}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => { setEditing(s); setForm({ name: s.name, display_name: s.display_name || '', description: s.description || '', icon: s.icon || '📚', color: s.color || '#00d4ff' }) }}
                className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>Edit</button>
              <button onClick={() => handleDelete(s.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
