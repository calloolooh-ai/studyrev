import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Subject = {
  id: string
  name: string
  display_name: string
  description: string
  color: string
  icon: string
}

export type Topic = {
  id: string
  subject_id: string
  name: string
  order_index: number
}

export type Question = {
  id: string
  topic_id: string
  question_text: string
  answer_text: string | null
  marks: number | null
  difficulty: string | null
}

export type Note = {
  id: string
  topic_id: string
  content: string
  title: string | null
}
