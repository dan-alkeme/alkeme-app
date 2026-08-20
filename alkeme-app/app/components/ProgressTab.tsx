'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Flame, Activity, Calendar, TrendingDown, TrendingUp } from 'lucide-react'

const PHASE_ORDER: Record<string, number> = {
  'Joint Mobility': 1,
  'Flexibility': 2,
  'Rehab Strength - Phase 1': 3,
  'Rehab Strength - Phase 2': 4,
  'Rehab Strength - Phase 3': 5,
  'Rehab Strength - Phase 4': 6,
  'Balance & Proprioception': 7,
  'Trunk & Spine Stability': 8
}

function dateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function shortDate(ts: string) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
function computeStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0
  const today = new Date()
  const yest = new Date(today); yest.setDate(today.getDate() - 1)
  if (!dates.has(dateKey(today)) && !dates.has(dateKey(yest))) return 0
  let cursor = new Date(today)
  if (!dates.has(dateKey(today))) cursor = yest
  let streak = 0
  while (dates.has(dateKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export default function ProgressTab() {
  const [loading, setLoading] = useState(true)
  const [overall, setOverall] = useState(0)
  const [streak, setStreak] = useState(0)
  const [sessions, setSessions] = useState(0)
  const [weeksIn, setWeeksIn] = useState(0)
  const [weekDays, setWeekDays] = useState<{ letter: string; active: boolean }[]>([])
  const [phaseProgress, setPhaseProgress] = useState<{ phase: string; pct: number }[]>([])
  const [pain, setPain] = useState<{ level: number; label: string }[]>([])
  // Check-in de salida
  const [hasActivityToday, setHasActivityToday] = useState(false)
  const [endDone, setEndDone] = useState(false)
  const [endLevel, setEndLevel] = useState<number | null>(null)

  useEffect(() => { loadProgress() }, [])

  async function loadProgress() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }
      const uid = session.user.id

      const { data: plan } = await supabase
        .from('recovery_plans').select('exercise_ids')
        .eq('user_id', uid).maybeSingle()
      const planIds: string[] = (plan?.exercise_ids as string[]) || []

      let planExercises: { id: string; phase: string | null }[] = []
      if (planIds.length) {
        const { data: exs } = await supabase
          .from('exercises').select('id, phase').in('id', planIds)
        planExercises = (exs || []) as any
      }

      const { data: logs } = await supabase
        .from('exercise_logs').select('exercise_id, completed_at').eq('user_id', uid)
      const logRows = logs || []

      const { data: dlogs } = await supabase
        .from('discomfort_logs').select('level, logged_at, checkpoint')
        .eq('user_id', uid).order('logged_at', { ascending: true })
      const discomfort = dlogs || []

      // === Cálculos con datos reales ===
      const now = new Date()
      const todayStr = dateKey(now)
      const dateSet = new Set(logRows.map(l => dateKey(new Date(l.completed_at as string))))
      const planIdSet = new Set(planIds)
      const doneIds = new Set(
        logRows.map(l => l.exercise_id as string).filter(id => planIdSet.has(id))
      )

      setOverall(planIds.length ? Math.round((doneIds.size / planIds.length) * 100) : 0)
      setStreak(computeStreak(dateSet))
      setSessions(dateSet.size)

      if (logRows.length) {
        const firstTs = Math.min(...logRows.map(l => new Date(l.completed_at as string).getTime()))
        setWeeksIn(Math.floor((Date.now() - firstTs) / (7 * 24 * 3600 * 1000)) + 1)
      } else {
        setWeeksIn(0)
      }

      const dow = (now.getDay() + 6) % 7
      const monday = new Date(now); monday.setDate(now.getDate() - dow); monday.setHours(0, 0, 0, 0)
      const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
      const wd = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday); d.setDate(monday.getDate() + i)
        wd.push({ letter: letters[i], active: dateSet.has(dateKey(d)) })
      }
      setWeekDays(wd)

      const totals: Record<string, number> = {}
      const done: Record<string, number> = {}
      for (const ex of planExercises) {
        const ph = ex.phase || 'General'
        totals[ph] = (totals[ph] || 0) + 1
        if (doneIds.has(ex.id)) done[ph] = (done[ph] || 0) + 1
      }
      setPhaseProgress(
        Object.keys(totals)
          .map(ph => ({ phase: ph, pct: Math.round(((done[ph] || 0) / totals[ph]) * 100) }))
          .sort((a, b) => (PHASE_ORDER[a.phase] || 99) - (PHASE_ORDER[b.phase] || 99))
      )

      // Gráfico: últimos 10 check-ins
      setPain(
        discomfort.slice(-10).map(d => ({
          level: d.level as number,
          label: shortDate(d.logged_at as string)
        }))
      )

      // Check-in de salida: ¿hubo actividad hoy? ¿ya respondió el 'end' de hoy?
      const activityToday = logRows.some(l => dateKey(new Date(l.completed_at as string)) === todayStr)
      setHasActivityToday(activityToday)
      const endLog = discomfort.find(
        d => (d as any).checkpoint === 'end' && dateKey(new Date(d.logged_at as string)) === todayStr
      )
      setEndDone(!!endLog)
      setEndLevel(endLog ? (endLog.level as number) : null)

      setLoading(false)
    } catch (e) {
      console.error('Progress load error:', e)
      setLoading(false)
    }
  }

  async function submitEndCheckin(level: number) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setEndDone(true)      // bloquea de inmediato
    setEndLevel(level)
    const { error } = await supabase
      .from('discomfort_logs')
      .insert({ user_id: session.user.id, level, checkpoint: 'end' })
    if (error) { console.error('Discomfort save error:', error.message); return }
    setPain(prev => [...prev, { level, label: shortDate(new Date().toISOString()) }].slice(-10))
  }

  const activeThisWeek = weekDays.filter(d => d.active).length
  const trend = pain.length >= 2
    ? (pain[pain.length - 1].level < pain[0].level ? 'down'
      : pain[pain.length - 1].level > pain[0].level ? 'up' : 'flat')
    : 'flat'

  if (loading) {
    return (
      <div className='flex justify-center py-20'>
        <div className='flex gap-1.5'>
          {[0, 150, 300].map(d => (
            <span key={d} className='w-2 h-2 bg-[#C9A84C] rounded-full animate-bounce'
              style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>

      {/* Header */}
      <div>
        <p className='text-[#C9A84C] text-xs tracking-[0.3em] font-semibold uppercase mb-3'>
          Progress Tracking
        </p>
        <h1 className='font-[Barlow_Condensed] text-4xl font-bold text-white'>
          YOUR PROGRESS
        </h1>
      </div>

      {/* Check-in de salida — se habilita tras actividad, se bloquea al responder */}
      <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-5'>
        <h3 className='font-[Barlow_Condensed] text-lg font-bold text-white'>
          End-of-session check-in
        </h3>
        {endDone ? (
          <p className='text-[#5FBF7F] text-sm mt-2'>
            ✓ Logged for today{endLevel !== null ? `: ${endLevel}/10` : ''}. See you next session.
          </p>
        ) : !hasActivityToday ? (
          <p className='text-[#888] text-sm mt-2'>
            Complete at least one exercise today to unlock your check-in.
          </p>
        ) : (
          <>
            <p className='text-[#666] text-xs mt-1 mb-3'>
              How do you feel now? 0 = no discomfort · 10 = worst
            </p>
            <div className='flex flex-wrap gap-1.5'>
              {Array.from({ length: 11 }, (_, n) => n).map(n => (
                <button key={n} onClick={() => submitEndCheckin(n)}
                  className='w-8 h-8 rounded-lg text-xs font-bold bg-[#1A1A1A] border border-[#2A2A2A]
                    text-[#999] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C]
                    transition-colors'>
                  {n}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Barra grande: recuperación general con "You are here" */}
      <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-5'>
        <div className='flex items-baseline justify-between mb-5'>
          <span className='text-[#888] text-xs uppercase tracking-[0.2em]'>Overall Recovery</span>
          <span className='font-[Barlow_Condensed] font-bold text-[#C9A84C] leading-none text-4xl'>
            {overall}<span className='text-2xl'>%</span>
          </span>
        </div>

        <div className='relative' style={{ paddingTop: '34px', paddingBottom: '8px' }}>
          <div className='absolute top-0 flex flex-col items-center z-10'
            style={{ left: `${overall}%`, transform: 'translateX(-50%)' }}>
            <span className='bg-[#C9A84C] text-black text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap leading-none'>
              You are here
            </span>
            <span className='w-2 h-2 bg-[#C9A84C] rotate-45 -mt-1' />
          </div>

          <div className='h-3 rounded-full bg-[#1A1A1A]'>
            <div className='h-3 rounded-full'
              style={{ width: `${overall}%`, background: 'linear-gradient(90deg, #C9A84C, #E8C96A)' }} />
          </div>

          <div className='absolute w-5 h-5 rounded-full bg-white border-[3px] border-[#C9A84C] z-10'
            style={{ left: `${overall}%`, top: '34px', transform: 'translate(-50%, -4px)' }} />

          <div className='relative mt-4 h-9'>
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(tick => (
              <div key={tick} className='absolute flex flex-col items-center'
                style={{ left: `${tick}%`, transform: 'translateX(-50%)' }}>
                <span className='text-white text-[8px] leading-none mb-1'>{tick}%</span>
                <span className='text-white leading-none' style={{ fontSize: '10px' }}>|</span>
              </div>
            ))}
          </div>
        </div>

        <div className='flex justify-between mt-3'>
          <span className='text-[#555] text-[10px] uppercase tracking-wider'>Start</span>
          <span className='text-[#555] text-[10px] uppercase tracking-wider'>Recovered</span>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className='grid grid-cols-3 gap-3'>
        <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-4 text-center'>
          <Flame size={18} className='text-[#C9A84C] mx-auto mb-2' />
          <p className='font-[Barlow_Condensed] text-3xl font-bold text-white leading-none'>{streak}</p>
          <p className='text-[#666] text-[10px] uppercase tracking-wider mt-1.5'>Day streak</p>
        </div>
        <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-4 text-center'>
          <Activity size={18} className='text-[#C9A84C] mx-auto mb-2' />
          <p className='font-[Barlow_Condensed] text-3xl font-bold text-white leading-none'>{sessions}</p>
          <p className='text-[#666] text-[10px] uppercase tracking-wider mt-1.5'>Sessions</p>
        </div>
        <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-4 text-center'>
          <Calendar size={18} className='text-[#C9A84C] mx-auto mb-2' />
          <p className='font-[Barlow_Condensed] text-3xl font-bold text-white leading-none'>{weeksIn}</p>
          <p className='text-[#666] text-[10px] uppercase tracking-wider mt-1.5'>Weeks in</p>
        </div>
      </div>

      {/* Actividad de la semana */}
      <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-5'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-[Barlow_Condensed] text-lg font-bold text-white'>This Week</h3>
          <span className='text-[#888] text-xs'>{activeThisWeek} of 7 days</span>
        </div>
        <div className='flex justify-between'>
          {weekDays.map((d, i) => (
            <div key={i} className='flex flex-col items-center gap-2'>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${d.active ? 'bg-[#C9A84C] text-black' : 'bg-[#1A1A1A] text-[#555] border border-[#2A2A2A]'}`}>
                {d.active ? '✓' : ''}
              </div>
              <span className='text-[#666] text-[10px]'>{d.letter}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Avance por fase */}
      <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-5'>
        <h3 className='font-[Barlow_Condensed] text-lg font-bold text-white mb-4'>
          Progress by Phase
        </h3>
        {phaseProgress.length === 0 ? (
          <p className='text-[#555] text-sm'>Complete exercises to see your phase progress.</p>
        ) : (
          <div className='space-y-4'>
            {phaseProgress.map(p => (
              <div key={p.phase}>
                <div className='flex justify-between text-xs mb-1.5'>
                  <span className='text-[#CCC]'>{p.phase}</span>
                  <span className='text-[#C9A84C] font-semibold'>{p.pct}%</span>
                </div>
                <div className='h-2 bg-[#1A1A1A] rounded-full overflow-hidden'>
                  <div className='h-full rounded-full'
                    style={{ width: `${p.pct}%`, background: 'linear-gradient(90deg, #C9A84C, #E8C96A)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial de molestia */}
      <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-5'>
        <div className='flex items-center justify-between mb-5'>
          <h3 className='font-[Barlow_Condensed] text-lg font-bold text-white'>Discomfort Level</h3>
          {trend === 'down' && (
            <div className='flex items-center gap-1.5 text-[#5FBF7F]'>
              <TrendingDown size={16} />
              <span className='text-xs font-semibold'>Trending down</span>
            </div>
          )}
          {trend === 'up' && (
            <div className='flex items-center gap-1.5 text-[#C97C4C]'>
              <TrendingUp size={16} />
              <span className='text-xs font-semibold'>Trending up</span>
            </div>
          )}
        </div>
        {pain.length === 0 ? (
          <p className='text-[#555] text-sm text-center py-6'>
            No check-ins yet. They will appear here as you log how you feel.
          </p>
        ) : (
          <>
            <div className='flex items-end justify-between gap-2 h-32'>
              {pain.map((p, i) => (
                <div key={i} className='flex-1 flex flex-col items-center h-full'>
                  <div className='flex-1 w-full flex items-end'>
                    <div className='w-full bg-[#1A1A1A] rounded-md flex items-end h-full'>
                      <div className='w-full rounded-md'
                        style={{ height: `${p.level * 10}%`, background: 'linear-gradient(180deg, #E8C96A, #C9A84C)' }} />
                    </div>
                  </div>
                  <span className='text-[#666] text-[10px] mt-2'>{p.label}</span>
                </div>
              ))}
            </div>
            <p className='text-[#666] text-xs mt-4 text-center'>
              Your last {pain.length} check-in{pain.length > 1 ? 's' : ''}.
            </p>
          </>
        )}
      </div>
    </div>
  )
}