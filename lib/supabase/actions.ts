'use server'

import { createClient } from './server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Profile is automatically created by database trigger (handle_new_user)
  // when the user signs up - no manual insert needed

  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// Signal actions
export async function createSignal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('signals') as any).insert({
    pair: formData.get('pair') as string,
    action: formData.get('action') as 'LONG' | 'SHORT',
    entry_price: parseFloat(formData.get('entry') as string),
    take_profit: parseFloat(formData.get('takeProfit') as string),
    stop_loss: parseFloat(formData.get('stopLoss') as string),
    notes: formData.get('notes') as string || null,
    status: formData.get('publish') === 'true' ? 'active' : 'draft',
    created_by: user.id,
    ai_generated: false,
  })

  if (error) throw error
  revalidatePath('/admin/signals')
}

export async function updateSignalStatus(id: string, status: 'draft' | 'active' | 'closed') {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (status === 'closed') {
    updateData.closed_at = new Date().toISOString()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('signals') as any)
    .update(updateData)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/signals')
}

// Content actions
export async function createContent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('content') as any).insert({
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    type: formData.get('type') as 'course' | 'video' | 'article' | 'tutorial',
    status: 'draft',
    author_id: user.id,
    ai_generated: false,
  })

  if (error) throw error
  revalidatePath('/admin/content')
}

// AI Task actions
export async function createAITask(agentType: string, taskDescription: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('ai_tasks') as any).insert({
    agent_type: agentType as 'content_creator' | 'signal_analyst' | 'social_manager' | 'course_builder' | 'support_agent',
    task_description: taskDescription,
    status: 'pending',
    created_by: user.id,
  }).select().single()

  if (error) throw error
  revalidatePath('/admin/ai-agents')
  return data
}
