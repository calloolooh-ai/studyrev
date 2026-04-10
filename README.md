# StudyRev 📚

A minimal, fast, interactive exam revision website for students. Built with Next.js 14, Supabase, and deployed on Vercel.

## Features

- 📖 **Structured Notes** — Markdown-rendered topic notes
- ✏️ **Practice Mode** — One question at a time, reveal answer, bookmark questions
- ⏱ **Quiz Mode** — Timed 5-question quizzes with self-graded scoring
- 🔖 **Bookmark System** — Star questions and topics, stored in localStorage
- ✅ **Progress Tracking** — Mark topics as done, progress bar per subject
- 📝 **Personal Notes** — Write your own notes per topic (localStorage)
- 🔍 **Search** — Frontend filtering across all topics and questions

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/studyrev.git
cd studyrev
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the Supabase dashboard, go to **SQL Editor**
3. Paste and run the contents of `supabase/seed.sql`
4. This creates all tables, enables RLS with public read, and seeds sample data

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in Supabase: **Settings → API**

### 4. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A: GitHub + Vercel (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel
```

---

## Project Structure

```
studyrev/
├── app/
│   ├── page.tsx              # Home — subject cards
│   ├── layout.tsx            # Root layout + Navbar
│   ├── globals.css           # Design system
│   ├── not-found.tsx         # 404 page
│   ├── subject/[subject]/    # Subject page — topic list
│   │   └── page.tsx
│   ├── topic/[id]/           # Topic page — 4 tab modes
│   │   └── page.tsx
│   ├── saved/                # Bookmarked content
│   │   └── page.tsx
│   └── search/               # Search page
│       └── page.tsx
├── components/
│   ├── Navbar.tsx            # Sticky navigation
│   ├── TopicList.tsx         # Topic list with progress
│   ├── TopicTabs.tsx         # Notes/Practice/Quiz/MyNotes
│   └── ProgressBadge.tsx     # Subject progress indicator
├── lib/
│   ├── supabase.ts           # Supabase client + types
│   └── storage.ts            # localStorage helpers
└── supabase/
    └── seed.sql              # Full DB schema + sample data
```

---

## Database Schema

```sql
subjects   — id, name, display_name, description, icon, color
topics     — id, subject_id, name, order_index
questions  — id, topic_id, question_text, answer_text, marks, difficulty
notes      — id, topic_id, title, content (markdown)
```

---

## Adding Content

### Add a new subject

```sql
INSERT INTO subjects (name, display_name, description, icon, color)
VALUES ('math', 'Mathematics (0580)', 'IGCSE Mathematics', '∑', '#00ff9d');
```

### Add topics

```sql
INSERT INTO topics (subject_id, name, order_index)
SELECT id, 'Algebra', 1 FROM subjects WHERE name = 'math';
```

### Add questions

```sql
INSERT INTO questions (topic_id, question_text, answer_text, marks, difficulty)
SELECT id, 'Solve 3x + 7 = 22', 'x = 5', 2, 'easy'
FROM topics WHERE name = 'Algebra';
```

---

## localStorage Keys

| Key | Contents |
|-----|----------|
| `sr_bookmarked_questions` | Array of bookmarked question IDs |
| `sr_bookmarked_topics` | Array of bookmarked topic IDs |
| `sr_completed_topics` | Array of completed topic IDs |
| `sr_note_{topicId}` | Student's personal note text |
| `sr_quiz_history` | Last 50 quiz results |

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |
| Styling | Plain CSS (no Tailwind) |
| Markdown | react-markdown |
| State | React hooks + localStorage |
| Auth | None required |

---

## License

MIT
