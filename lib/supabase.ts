import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Types ──────────────────────────────────────────────────────

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

export type UserProfile = {
  id: string
  email: string
  display_name: string | null
  is_admin: boolean
  created_at: string
}

// ── Auth helpers ───────────────────────────────────────────────

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  const profile = await getUserProfile(user.id)
  return profile?.is_admin ?? false
}

export async function signOut() {
  await supabase.auth.signOut()
}
