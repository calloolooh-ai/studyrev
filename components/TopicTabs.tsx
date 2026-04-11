'use client'
import { useState, useEffect, useRef } from ‘react’
import ReactMarkdown from ‘react-markdown’
import {
getBookmarkedQuestions, toggleBookmarkQuestion,
getStudentNote, saveStudentNote,
saveQuizResult
} from ‘@/lib/storage’

type Props = { topic: any; notes: any[]; questions: any[] }

export default function TopicTabs({ topic, notes, questions }: Props) {
const [tab, setTab] = useState<‘notes’ | ‘practice’ | ‘quiz’ | ‘mynotes’>(‘notes’)

const tabs = [
{ id: ‘notes’, label: ‘📖 Notes’ },
{ id: ‘practice’, label: ‘✏️ Practice’ },
{ id: ‘quiz’, label: ‘⏱ Quiz’ },
{ id: ‘mynotes’, label: ‘📝 My Notes’ },
] as const

return (
<div>
<div className=“tabs” style={{ marginBottom: ‘28px’ }}>
{tabs.map(t => (
<button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
{t.label}
</button>
))}
</div>
<div className="fade-in" key={tab}>
{tab === ‘notes’ && <NotesTab notes={notes} />}
{tab === ‘practice’ && <PracticeTab questions={questions} />}
{tab === ‘quiz’ && <QuizTab questions={questions} topicId={topic.id} topicName={topic.name} />}
{tab === ‘mynotes’ && <MyNotesTab topicId={topic.id} />}
</div>
</div>
)
}

// ── Notes Tab ──────────────────────────────────────────────────────────────────

function NotesTab({ notes }: { notes: any[] }) {
if (notes.length === 0) {
return (
<div style={{ textAlign: ‘center’, padding: ‘60px’, color: ‘var(–text3)’ }}>
<div style={{ fontSize: ‘32px’, marginBottom: ‘12px’ }}>📄</div>
<p style={{ fontFamily: ‘var(–font-mono)’, fontSize: ‘13px’ }}>No notes for this topic yet.</p>
</div>
)
}
return (
<div style={{ display: ‘flex’, flexDirection: ‘column’, gap: ‘24px’ }}>
{notes.map((note: any) => (
<div key={note.id} className="card">
{note.title && (
<h3 style={{
fontFamily: ‘var(–font-display)’, fontSize: ‘1.1rem’, marginBottom: ‘16px’,
color: ‘var(–cyan)’, paddingBottom: ‘12px’, borderBottom: ‘1px solid var(–border)’,
}}>{note.title}</h3>
)}
<div className="markdown">
<ReactMarkdown>{note.content}</ReactMarkdown>
</div>
</div>
))}
</div>
)
}

// ── Practice Tab ───────────────────────────────────────────────────────────────

function PracticeTab({ questions }: { questions: any[] }) {
const [idx, setIdx] = useState(0)
const [revealed, setRevealed] = useState(false)
const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({})

useEffect(() => {
getBookmarkedQuestions().then(ids => {
const map: Record<string, boolean> = {}
questions.forEach(q => { map[q.id] = ids.includes(q.id) })
setBookmarked(map)
})
}, [questions])

if (questions.length === 0) {
return (
<div style={{ textAlign: ‘center’, padding: ‘60px’, color: ‘var(–text3)’ }}>
<div style={{ fontSize: ‘32px’, marginBottom: ‘12px’ }}>✏️</div>
<p style={{ fontFamily: ‘var(–font-mono)’, fontSize: ‘13px’ }}>No questions for this topic yet.</p>
</div>
)
}

const q = questions[idx]
const pct = Math.round(((idx + 1) / questions.length) * 100)

function next() { setIdx((idx + 1) % questions.length); setRevealed(false) }
function prev() { setIdx((idx - 1 + questions.length) % questions.length); setRevealed(false) }

async function handleBookmark() {
const now = await toggleBookmarkQuestion(q.id)
setBookmarked(b => ({ …b, [q.id]: now }))
}

return (
<div>
<div style={{ marginBottom: ‘20px’ }}>
<div style={{ display: ‘flex’, justifyContent: ‘space-between’, marginBottom: ‘8px’ }}>
<span style={{ fontFamily: ‘var(–font-mono)’, fontSize: ‘12px’, color: ‘var(–text3)’ }}>
Question {idx + 1} of {questions.length}
</span>
{q.marks && <span className="badge badge-amber">{q.marks} mark{q.marks !== 1 ? ‘s’ : ‘’}</span>}
</div>
<div className="progress-bar">
<div className=“progress-bar-fill” style={{ width: `${pct}%` }} />
</div>
</div>

```
  <div className="card" style={{ marginBottom: '16px', minHeight: '180px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text3)', textTransform: 'uppercase' }}>
        Question
      </span>
      <button onClick={handleBookmark} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '18px', color: 'var(--amber)',
        opacity: bookmarked[q.id] ? 1 : 0.3,
      }}>
        {bookmarked[q.id] ? '★' : '☆'}
      </button>
    </div>
    <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text)' }}>{q.question_text}</p>
  </div>

  {revealed ? (
    <div className="card" style={{ marginBottom: '20px', borderColor: 'rgba(0,255,157,0.3)', background: 'var(--green-dim)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green)', marginBottom: '12px', textTransform: 'uppercase' }}>
        ✓ Answer
      </div>
      <div className="markdown">
        <ReactMarkdown>{q.answer_text || 'No answer provided.'}</ReactMarkdown>
      </div>
    </div>
  ) : (
    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '20px', padding: '14px' }}
      onClick={() => setRevealed(true)}>
      Show Answer
    </button>
  )}

  <div style={{ display: 'flex', gap: '12px' }}>
    <button className="btn btn-ghost" onClick={prev} style={{ flex: 1, justifyContent: 'center' }}>← Prev</button>
    <button className="btn btn-ghost" onClick={next} style={{ flex: 1, justifyContent: 'center' }}>Next →</button>
  </div>
</div>
```

)
}

// ── Quiz Tab ───────────────────────────────────────────────────────────────────

type QuizState = ‘idle’ | ‘running’ | ‘done’

function QuizTab({ questions, topicId, topicName }: { questions: any[]; topicId: string; topicName: string }) {
const [state, setState] = useState<QuizState>(‘idle’)
const [pool, setPool] = useState<any[]>([])
const [current, setCurrent] = useState(0)
const [revealed, setRevealed] = useState(false)
const [answers, setAnswers] = useState<(‘correct’ | ‘wrong’ | null)[]>([])
const [timeLeft, setTimeLeft] = useState(0)
const [elapsed, setElapsed] = useState(0)
const timerRef = useRef<NodeJS.Timeout>()
const QUIZ_COUNT = Math.min(5, questions.length)
const TIME_PER_Q = 90

function startQuiz() {
const shuffled = […questions].sort(() => Math.random() - 0.5).slice(0, QUIZ_COUNT)
setPool(shuffled)
setCurrent(0)
setRevealed(false)
setAnswers(new Array(QUIZ_COUNT).fill(null))
setTimeLeft(QUIZ_COUNT * TIME_PER_Q)
setElapsed(0)
setState(‘running’)
}

useEffect(() => {
if (state !== ‘running’) { clearInterval(timerRef.current); return }
timerRef.current = setInterval(() => {
setTimeLeft(t => {
if (t <= 1) { clearInterval(timerRef.current); finishQuiz(); return 0 }
return t - 1
})
setElapsed(e => e + 1)
}, 1000)
return () => clearInterval(timerRef.current)
}, [state])

function answer(result: ‘correct’ | ‘wrong’) {
const updated = […answers]
updated[current] = result
setAnswers(updated)
setTimeout(() => {
if (current + 1 >= QUIZ_COUNT) { finishQuiz(updated) }
else { setCurrent(c => c + 1); setRevealed(false) }
}, 800)
}

function finishQuiz(finalAnswers?: (‘correct’ | ‘wrong’ | null)[]) {
clearInterval(timerRef.current)
setState(‘done’)
const a = finalAnswers || answers
const score = a.filter(x => x === ‘correct’).length
saveQuizResult({ topicId, score, total: pool.length, date: new Date().toISOString() })
}

if (questions.length < 2) {
return (
<div style={{ textAlign: ‘center’, padding: ‘60px’, color: ‘var(–text3)’ }}>
<div style={{ fontSize: ‘32px’, marginBottom: ‘12px’ }}>⏱</div>
<p style={{ fontFamily: ‘var(–font-mono)’, fontSize: ‘13px’ }}>Need at least 2 questions for quiz mode.</p>
</div>
)
}

if (state === ‘idle’) return (
<div style={{ textAlign: ‘center’, padding: ‘40px 20px’ }}>
<div style={{ fontSize: ‘48px’, marginBottom: ‘16px’ }}>⏱</div>
<h2 style={{ fontFamily: ‘var(–font-display)’, marginBottom: ‘10px’ }}>Timed Quiz</h2>
<p style={{ color: ‘var(–text2)’, marginBottom: ‘8px’ }}>
{QUIZ_COUNT} random questions · {TIME_PER_Q}s per question
</p>
<p style={{ color: ‘var(–text3)’, fontSize: ‘13px’, marginBottom: ‘32px’, fontFamily: ‘var(–font-mono)’ }}>
Mark yourself correct or wrong after seeing the answer
</p>
<button className=“btn btn-primary” style={{ padding: ‘14px 32px’, fontSize: ‘16px’ }} onClick={startQuiz}>
Start Quiz →
</button>
</div>
)

if (state === ‘done’) {
const score = answers.filter(x => x === ‘correct’).length
const pct = Math.round((score / pool.length) * 100)
const grade = pct >= 80 ? { label: ‘Excellent!’, color: ‘var(–green)’ }
: pct >= 60 ? { label: ‘Good job’, color: ‘var(–cyan)’ }
: pct >= 40 ? { label: ‘Keep going’, color: ‘var(–amber)’ }
: { label: ‘Needs work’, color: ‘var(–red)’ }
const mins = Math.floor(elapsed / 60), secs = elapsed % 60

```
return (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <div style={{ fontSize: '64px', marginBottom: '16px' }}>
      {pct >= 80 ? '🎉' : pct >= 60 ? '👍' : pct >= 40 ? '💪' : '📚'}
    </div>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '4rem', fontWeight: 700, color: grade.color, marginBottom: '8px' }}>
      {score}/{pool.length}
    </div>
    <div style={{ fontSize: '1.2rem', color: grade.color, fontFamily: 'var(--font-display)', marginBottom: '6px' }}>{grade.label}</div>
    <div style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginBottom: '32px' }}>
      {pct}% · {mins}m {secs}s
    </div>
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
      {answers.map((a, i) => (
        <div key={i} style={{
          width: 36, height: 36, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: a === 'correct' ? 'var(--green-dim)' : a === 'wrong' ? 'var(--red-dim)' : 'var(--surface)',
          border: `1px solid ${a === 'correct' ? 'rgba(0,255,157,0.4)' : a === 'wrong' ? 'rgba(255,77,106,0.4)' : 'var(--border)'}`,
          fontSize: '14px',
        }}>
          {a === 'correct' ? '✓' : a === 'wrong' ? '✗' : '–'}
        </div>
      ))}
    </div>
    <button className="btn btn-primary" onClick={startQuiz} style={{ padding: '12px 28px' }}>
      Retake Quiz
    </button>
  </div>
)
```

}

const q = pool[current]
const mins = Math.floor(timeLeft / 60)
const secs = timeLeft % 60
const timePct = (timeLeft / (QUIZ_COUNT * TIME_PER_Q)) * 100
const timeColor = timeLeft < 30 ? ‘var(–red)’ : timeLeft < 60 ? ‘var(–amber)’ : ‘var(–cyan)’

return (
<div>
<div style={{ display: ‘flex’, justifyContent: ‘space-between’, alignItems: ‘center’, marginBottom: ‘12px’ }}>
<span style={{ fontFamily: ‘var(–font-mono)’, fontSize: ‘12px’, color: ‘var(–text3)’ }}>
{current + 1} / {QUIZ_COUNT}
</span>
<span style={{
fontFamily: ‘var(–font-mono)’, fontSize: ‘16px’, fontWeight: 700, color: timeColor,
background: `${timeColor}15`, padding: ‘4px 12px’, borderRadius: ‘6px’,
border: `1px solid ${timeColor}40`,
}}>
{String(mins).padStart(2, ‘0’)}:{String(secs).padStart(2, ‘0’)}
</span>
</div>

```
  <div className="progress-bar" style={{ marginBottom: '24px' }}>
    <div style={{
      height: '100%', width: `${timePct}%`,
      background: `linear-gradient(90deg, ${timeColor}, ${timeColor}88)`,
      borderRadius: '10px', transition: 'width 1s linear',
    }} />
  </div>

  <div className="card" style={{ marginBottom: '16px', minHeight: '160px' }}>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text3)', marginBottom: '12px', textTransform: 'uppercase' }}>
      Question {current + 1}
      {q.marks && <span className="badge badge-amber" style={{ marginLeft: '10px' }}>{q.marks}m</span>}
    </div>
    <p style={{ fontSize: '16px', lineHeight: '1.7' }}>{q.question_text}</p>
  </div>

  {!revealed ? (
    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
      onClick={() => setRevealed(true)}>
      Reveal Answer
    </button>
  ) : (
    <div>
      <div className="card" style={{ marginBottom: '16px', borderColor: 'rgba(0,212,255,0.3)', background: 'var(--cyan-dim)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan)', marginBottom: '12px', textTransform: 'uppercase' }}>
          Answer
        </div>
        <div className="markdown">
          <ReactMarkdown>{q.answer_text || 'No answer provided.'}</ReactMarkdown>
        </div>
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '13px', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
        How did you do?
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => answer('wrong')} className="btn" style={{
          flex: 1, justifyContent: 'center', padding: '14px',
          background: 'var(--red-dim)', color: 'var(--red)',
          border: '1px solid rgba(255,77,106,0.3)',
        }}>✗ Incorrect</button>
        <button onClick={() => answer('correct')} className="btn" style={{
          flex: 1, justifyContent: 'center', padding: '14px',
          background: 'var(--green-dim)', color: 'var(--green)',
          border: '1px solid rgba(0,255,157,0.3)',
        }}>✓ Correct</button>
      </div>
    </div>
  )}
</div>
```

)
}

// ── My Notes Tab ───────────────────────────────────────────────────────────────

function MyNotesTab({ topicId }: { topicId: string }) {
const [note, setNote] = useState(’’)
const [saved, setSaved] = useState(false)
const [loading, setLoading] = useState(true)

useEffect(() => {
getStudentNote(topicId).then(n => { setNote(n); setLoading(false) })
}, [topicId])

async function handleSave() {
await saveStudentNote(topicId, note)
setSaved(true)
setTimeout(() => setSaved(false), 2000)
}

if (loading) return (
<div style={{ textAlign: ‘center’, padding: ‘40px’, color: ‘var(–text3)’, fontFamily: ‘var(–font-mono)’, fontSize: ‘13px’ }}>
Loading…
</div>
)

return (
<div>
<p style={{ color: ‘var(–text2)’, fontSize: ‘14px’, marginBottom: ‘16px’ }}>
Your personal notes for this topic. Synced to your account when logged in.
</p>
<textarea
value={note}
onChange={e => setNote(e.target.value)}
placeholder=“Write your notes here — key points, mnemonics, things to remember…”
style={{ minHeight: ‘260px’, marginBottom: ‘12px’ }}
/>
<div style={{ display: ‘flex’, gap: ‘12px’, alignItems: ‘center’ }}>
<button className="btn btn-primary" onClick={handleSave}>
{saved ? ‘✓ Saved!’ : ‘Save Notes’}
</button>
{note && (
<button className=“btn btn-ghost” onClick={() => { setNote(’’); saveStudentNote(topicId, ‘’) }}>
Clear
</button>
)}
<span style={{ fontSize: ‘12px’, color: ‘var(–text3)’, fontFamily: ‘var(–font-mono)’ }}>
{note.length} chars
</span>
</div>
</div>
)
}