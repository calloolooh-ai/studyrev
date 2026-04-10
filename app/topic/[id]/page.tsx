import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import TopicTabs from '@/components/TopicTabs'
import { notFound } from 'next/navigation'

export const revalidate = 60

async function getTopicData(id: string) {
  const { data: topic } = await supabase
    .from('topics')
    .select('*, subjects(*)')
    .eq('id', id)
    .single()

  if (!topic) return null

  const [{ data: notes }, { data: questions }] = await Promise.all([
    supabase.from('notes').select('*').eq('topic_id', id),
    supabase.from('questions').select('*').eq('topic_id', id).order('marks'),
  ])

  return {
    topic,
    notes: notes || [],
    questions: questions || [],
  }
}

export default async function TopicPage({ params }: { params: { id: string } }) {
  const data = await getTopicData(params.id)
  if (!data) notFound()
  const { topic, notes, questions } = data
  const subject = topic.subjects as any

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
        <Link href="/" style={{ color: 'var(--text3)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <Link href={`/subject/${subject?.name}`} style={{ color: 'var(--text3)' }}>
          {subject?.display_name || subject?.name}
        </Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--cyan)' }}>{topic.name}</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '10px' }}>{topic.name}</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
          <span className="badge badge-amber">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Tabs */}
      <TopicTabs topic={topic} notes={notes} questions={questions} />
    </div>
  )
}
