'use client'

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export function getBookmarkedQuestions(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('sr_bookmarked_questions') || '[]')
  } catch { return [] }
}

export function toggleBookmarkQuestion(id: string): boolean {
  const bookmarks = getBookmarkedQuestions()
  const idx = bookmarks.indexOf(id)
  if (idx >= 0) {
    bookmarks.splice(idx, 1)
  } else {
    bookmarks.push(id)
  }
  localStorage.setItem('sr_bookmarked_questions', JSON.stringify(bookmarks))
  return idx < 0 // true = now bookmarked
}

export function isQuestionBookmarked(id: string): boolean {
  return getBookmarkedQuestions().includes(id)
}

export function getBookmarkedTopics(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('sr_bookmarked_topics') || '[]')
  } catch { return [] }
}

export function toggleBookmarkTopic(id: string): boolean {
  const bookmarks = getBookmarkedTopics()
  const idx = bookmarks.indexOf(id)
  if (idx >= 0) {
    bookmarks.splice(idx, 1)
  } else {
    bookmarks.push(id)
  }
  localStorage.setItem('sr_bookmarked_topics', JSON.stringify(bookmarks))
  return idx < 0
}

export function isTopicBookmarked(id: string): boolean {
  return getBookmarkedTopics().includes(id)
}

// ── Progress ──────────────────────────────────────────────────────────────────

export function getCompletedTopics(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('sr_completed_topics') || '[]')
  } catch { return [] }
}

export function toggleTopicComplete(id: string): boolean {
  const completed = getCompletedTopics()
  const idx = completed.indexOf(id)
  if (idx >= 0) {
    completed.splice(idx, 1)
  } else {
    completed.push(id)
  }
  localStorage.setItem('sr_completed_topics', JSON.stringify(completed))
  return idx < 0
}

export function isTopicComplete(id: string): boolean {
  return getCompletedTopics().includes(id)
}

// ── Student Notes ─────────────────────────────────────────────────────────────

export function getStudentNote(topicId: string): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(`sr_note_${topicId}`) || ''
}

export function saveStudentNote(topicId: string, note: string) {
  localStorage.setItem(`sr_note_${topicId}`, note)
}

// ── Quiz History ──────────────────────────────────────────────────────────────

export type QuizResult = {
  topicId: string
  score: number
  total: number
  date: string
}

export function saveQuizResult(result: QuizResult) {
  if (typeof window === 'undefined') return
  const history: QuizResult[] = JSON.parse(localStorage.getItem('sr_quiz_history') || '[]')
  history.unshift(result)
  localStorage.setItem('sr_quiz_history', JSON.stringify(history.slice(0, 50)))
}

export function getQuizHistory(): QuizResult[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('sr_quiz_history') || '[]')
  } catch { return [] }
}
