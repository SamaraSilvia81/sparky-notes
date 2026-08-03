import { writable, derived } from 'svelte/store'
import { supabase } from '../services/supabase.js'

// ─── stores ───────────────────────────────────────────────────────────────────

const _events = writable([])
export const historyLoading = writable(false)

// ─── agrupamento por dia ──────────────────────────────────────────────────────

export const historyGroups = derived(_events, ($events) => {
  if ($events.length === 0) return []

  const groups = new Map()

  for (const ev of $events) {
    const key = dayKey(ev.created_at)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(ev)
  }

  return Array.from(groups.entries()).map(([key, events]) => ({
    label: dayLabel(key),
    events,
  }))
})

// ─── fetch ────────────────────────────────────────────────────────────────────

export async function loadHistory() {
  historyLoading.set(true)

  const { data, error } = await supabase
    .from('idea_events')
    .select(`
      id,
      user_id,
      idea_id,
      role,
      kind,
      text,
      summary,
      created_at,
      ideas ( title )
    `)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('[historyStore] erro ao carregar histórico:', error.message)
    historyLoading.set(false)
    return
  }

  const mapped = (data ?? []).map((row) => ({
    id:         row.id,
    user_id:    row.user_id,
    idea_id:    row.idea_id,
    role:       row.role,
    kind:       row.kind ?? null,
    text:       row.text,
    summary:    row.summary ?? null,
    created_at: row.created_at,
    idea_title: row.ideas?.title ?? '—',
  }))

  _events.set(mapped)
  historyLoading.set(false)
}

// ─── helpers de data ──────────────────────────────────────────────────────────

function dayKey(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dayLabel(key) {
  const today     = dayKey(new Date().toISOString())
  const yesterday = dayKey(new Date(Date.now() - 86_400_000).toISOString())

  if (key === today)     return 'hoje'
  if (key === yesterday) return 'ontem'

  const d = new Date(key + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace('.', '')
}