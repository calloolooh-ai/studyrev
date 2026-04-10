import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import TopicList from '@/components/TopicList'
import { notFound } from 'next/navigation'

export const revalidate = 60

async function getSubjectData(name: string) {
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('name', name)
    .single()

  if (!subject) return null

  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subject.id)
    .order('order_index', { ascending: true })

  return { subject, topics: topics || [] }
}

export default async function SubjectPage({ params }: { params: { subject: string } }) {
  const data = await getSubjectData(params.subject)
  if (!data) notFound()

  const { subject, topics } = data

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
        <Link href="/" style={{ color: 'var(--text3)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--cyan)' }}>{subject.display_name || subject.name}</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: '10px' }}>
          {subject.display_name || subject.name.toUpperCase()}
        </h1>
        {subject.description && (
          <p style={{ color: 'var(--text2)', fontSize: '15px' }}>{subject.description}</p>
        )}

        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">{topics.length} topics</span>
        </div>
      </div>

      {/* Topics */}
      <TopicList topics={topics} subjectName={subject.name} />
    </div>
  )
}
