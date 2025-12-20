'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from './client'
import type { Signal, Content, AITask } from './types'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// Real-time signals hook
export function useRealtimeSignals(initialSignals: Signal[] = []) {
  const [signals, setSignals] = useState<Signal[]>(initialSignals)
  // Memoize the Supabase client to avoid recreating on every render
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Fetch initial signals
    const fetchSignals = async () => {
      const { data } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setSignals(data)
    }
    fetchSignals()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('signals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'signals' },
        (payload: RealtimePostgresChangesPayload<Signal>) => {
          if (payload.eventType === 'INSERT') {
            setSignals(prev => [payload.new as Signal, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setSignals(prev =>
              prev.map(s => (s.id === (payload.new as Signal).id ? payload.new as Signal : s))
            )
          } else if (payload.eventType === 'DELETE') {
            setSignals(prev => prev.filter(s => s.id !== (payload.old as Signal).id))
          }
        }
      )
      .subscribe()

    return () => {
      // Properly unsubscribe before removing channel
      channel.unsubscribe().then(() => {
        supabase.removeChannel(channel)
      })
    }
  }, [supabase])

  return signals
}

// Real-time content hook
export function useRealtimeContent(initialContent: Content[] = []) {
  const [content, setContent] = useState<Content[]>(initialContent)
  // Memoize the Supabase client to avoid recreating on every render
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setContent(data)
    }
    fetchContent()

    const channel = supabase
      .channel('content-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'content' },
        (payload: RealtimePostgresChangesPayload<Content>) => {
          if (payload.eventType === 'INSERT') {
            setContent(prev => [payload.new as Content, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setContent(prev =>
              prev.map(c => (c.id === (payload.new as Content).id ? payload.new as Content : c))
            )
          } else if (payload.eventType === 'DELETE') {
            setContent(prev => prev.filter(c => c.id !== (payload.old as Content).id))
          }
        }
      )
      .subscribe()

    return () => {
      // Properly unsubscribe before removing channel
      channel.unsubscribe().then(() => {
        supabase.removeChannel(channel)
      })
    }
  }, [supabase])

  return content
}

// Real-time AI tasks hook
export function useRealtimeAITasks(initialTasks: AITask[] = []) {
  const [tasks, setTasks] = useState<AITask[]>(initialTasks)
  // Memoize the Supabase client to avoid recreating on every render
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from('ai_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (data) setTasks(data)
    }
    fetchTasks()

    const channel = supabase
      .channel('ai-tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_tasks' },
        (payload: RealtimePostgresChangesPayload<AITask>) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new as AITask, ...prev].slice(0, 50))
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev =>
              prev.map(t => (t.id === (payload.new as AITask).id ? payload.new as AITask : t))
            )
          }
        }
      )
      .subscribe()

    return () => {
      // Properly unsubscribe before removing channel
      channel.unsubscribe().then(() => {
        supabase.removeChannel(channel)
      })
    }
  }, [supabase])

  return tasks
}

// User profile hook
export function useProfile() {
  const [profile, setProfile] = useState<{
    id: string
    email: string
    full_name: string | null
    plan: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  // Memoize the Supabase client to avoid recreating on every render
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  return { profile, loading }
}
