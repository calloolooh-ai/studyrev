'use client'
import { useEffect, useState } from 'react'
import { getCompletedTopics } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

export default function ProgressBadge({ subjectId, subjectName, color }: {
  subjectId: string
  subjectName: string
  color: string
}) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('topics')
        .select('id')
        .eq('subject_id', subjectId)
      if (!data) return
      const completed = getCompletedTopics()
      const done = data.filter(t => completed.includes(t.id)).length
      setProgress({ done, total: data.length })
    }
    load()
  }, [subjectId])

  if (!progress || progress.total === 0) return null
  const pct = Math.round((progress.done / progress.total) * 100)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          Progress
        </span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color }}>
          {progress.done}/{progress.total}
        </span>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
        }} />
      </div>
    </div>
  )
}
