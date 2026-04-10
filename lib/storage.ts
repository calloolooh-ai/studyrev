'use client'
import { supabase } from './supabase'

// ── Helpers ────────────────────────────────────────────────────

async function getUid(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ── Bookmarks ─────────────────────────────────────────────────

export async function getBookmarkedQuestions(): Promise<string[]> {
  const uid = await getUid()
  if (uid) {
    const { data } = await supabase
      .from('user_bookmarks')
      .select('item_id')
      .eq('user_id', uid)
      .eq('item_type', 'question')
    return (data || []).map((r: any) => r.item_id)
  }
  try { return JSON.parse(localStorage.getItem('sr_bookmarked_questions') || '[]') }
  catch { return [] }
}

export async function toggleBookmarkQuestion(id: string): Promise<boolean> {
  const uid = await getUid()
  if (uid) {
    const { data } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('user_id', uid)
      .eq('item_id', id)
      .eq('item_type', 'question')
      .maybeSingle()
    if (data) {
      await supabase.from('user_bookmarks').delete().eq('id', data.id)
      return false
    } else {
      await supabase.from('user_bookmarks').insert({ user_id: uid, item_id: id, item_type: 'question' })
      return true
    }
  }
  const bookmarks: string[] = JSON.parse(localStorage.getItem('sr_bookmarked_questions') || '[]')
  const idx = bookmarks.indexOf(id)
  if (idx >= 0) { bookmarks.splice(idx, 1) } else { bookmarks.push(id) }
  localStorage.setItem('sr_bookmarked_questions', JSON.stringify(bookmarks))
  return idx < 0
}

export async function getBookmarkedTopics(): Promise<string[]> {
  const uid = await getUid()
  if (uid) {
    const { data } = await supabase
      .from('user_bookmarks')
      .select('item_id')
      .eq('user_id', uid)
      .eq('item_type', 'topic')
    return (data || []).map((r: any) => r.item_id)
  }
  try { return JSON.parse(localStorage.getItem('sr_bookmarked_topics') || '[]') }
  catch { return [] }
}

export async function toggleBookmarkTopic(id: string): Promise<boolean> {
  const uid = await getUid()
  if (uid) {
    const { data } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('user_id', uid)
      .eq('item_id', id)
      .eq('item_type', 'topic')
      .maybeSingle()
    if (data) {
      await supabase.from('user_bookmarks').delete().eq('id', data.id)
      return false
    } else {
      await supabase.from('user_bookmarks').insert({ user_id: uid, item_id: id, item_type: 'topic' })
      return true
    }
  }
  const bookmarks: string[] = JSON.parse(localStorage.getItem('sr_bookmarked_topics') || '[]')
  const idx = bookmarks.indexOf(id)
  if (idx >= 0) { bookmarks.splice(idx, 1) } else { bookmarks.push(id) }
  localStorage.setItem('sr_bookmarked_topics', JSON.stringify(bookmarks))
  return idx < 0
}

// ── Progress ──────────────────────────────────────────────────

export async function getCompletedTopics(): Promise<string[]> {
  const uid = await getUid()
  if (uid) {
    const { data } = await supabase
      .from('user_progress')
      .select('topic_id')
      .eq('user_id', uid)
      .eq('completed', true)
    return (data || []).map((r: any) => r.topic_id)
  }
  try { return JSON.parse(localStorage.getItem('sr_completed_topics') || '[]') }
  catch { return [] }
}

export async function toggleTopicComplete(id: string): Promise<boolean> {
  const uid = await getUid()
  if (uid) {
    const { data } = await supabase
      .from('user_progress')
      .select('id, completed')
      .eq('user_id', uid)
      .eq('topic_id', id)
      .maybeSingle()
    if (data) {
      const newVal = !data.completed
      await supabase.from('user_progress').update({ completed: newVal }).eq('id', data.id)
      return newVal
    } else {
      await supabase.from('user_progress').insert({ user_id: uid, topic_id: id, completed: true })
      return true
    }
  }
  const completed: string[] = JSON.parse(localStorage.getItem('sr_completed_topics') || '[]')
  const idx = completed.indexOf(id)
  if (idx >= 0) { completed.splice(idx, 1) } else { completed.push(id) }
  localStorage.setItem('sr_completed_topics', JSON.stringify(completed))
  return idx < 0
}

// ── Student Notes ─────────────────────────────────────────────

export async function getStudentNote(topicId: string): Promise<string> {
  const uid = await getUid()
  if (uid) {
    const { data } = await supabase
      .from('user_notes')
      .select('content')
      .eq('user_id', uid)
      .eq('topic_id', topicId)
      .maybeSingle()
    return data?.content || ''
  }
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(`sr_note_${topicId}`) || ''
}

export async function saveStudentNote(topicId: string, content: string): Promise<void> {
  const uid = await getUid()
  if (uid) {
    const { data } = await supabase
      .from('user_notes')
      .select('id')
      .eq('user_id', uid)
      .eq('topic_id', topicId)
      .maybeSingle()
    if (data) {
      await supabase.from('user_notes').update({ content }).eq('id', data.id)
    } else {
      await supabase.from('user_notes').insert({ user_id: uid, topic_id: topicId, content })
    }
    return
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(`sr_note_${topicId}`, content)
  }
}

// ── Quiz History ──────────────────────────────────────────────

export type QuizResult = {
  topicId: string
  score: number
  total: number
  date: string
}

export async function saveQuizResult(result: QuizResult): Promise<void> {
  const uid = await getUid()
  if (uid) {
    await supabase.from('user_quiz_results').insert({
      user_id: uid,
      topic_id: result.topicId,
      score: result.score,
      total: result.total,
    })
    return
  }
  if (typeof window === 'undefined') return
  const history: QuizResult[] = JSON.parse(localStorage.getItem('sr_quiz_history') || '[]')
  history.unshift(result)
  localStorage.setItem('sr_quiz_history', JSON.stringify(history.slice(0, 50)))
}

export async function getQuizHistory(): Promise<QuizResult[]> {
  const uid = await getUid()
  if (uid) {
    const { data } = await supabase
      .from('user_quiz_results')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(50)
    return (data || []).map((r: any) => ({
      topicId: r.topic_id,
      score: r.score,
      total: r.total,
      date: r.created_at,
    }))
  }
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('sr_quiz_history') || '[]') }
  catch { return [] }
}

export async function migrateLocalStorageToSupabase(uid: string): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const qBookmarks: string[] = JSON.parse(localStorage.getItem('sr_bookmarked_questions') || '[]')
    const tBookmarks: string[] = JSON.parse(localStorage.getItem('sr_bookmarked_topics') || '[]')
    const completed: string[] = JSON.parse(localStorage.getItem('sr_completed_topics') || '[]')
    const inserts = [
      ...qBookmarks.map(id => ({ user_id: uid, item_id: id, item_type: 'question' })),
      ...tBookmarks.map(id => ({ user_id: uid, item_id: id, item_type: 'topic' })),
    ]
    if (inserts.length > 0) {
      await supabase.from('user_bookmarks').upsert(inserts, { onConflict: 'user_id,item_id,item_type' })
    }
    if (completed.length > 0) {
      await supabase.from('user_progress').upsert(
        completed.map(id => ({ user_id: uid, topic_id: id, completed: true })),
        { onConflict: 'user_id,topic_id' }
      )
    }
  } catch (e) {
    console.error('Migration error:', e)
  }
}
