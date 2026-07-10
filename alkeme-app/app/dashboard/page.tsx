'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Home, Dumbbell, Video, Apple, LineChart } from 'lucide-react'

const TABS = [
  { id: 'home',      label: 'Home',      title: 'Welcome Back',       tagline: '',                                    Icon: Home },
  { id: 'plan',      label: 'Plan',      title: 'My Recovery Plan',   tagline: 'Your personalized exercise program',  Icon: Dumbbell },
  { id: 'videos',    label: 'Videos',    title: 'Video Library',      tagline: 'Guided exercise videos for your plan', Icon: Video },
  { id: 'nutrition', label: 'Nutrition', title: 'Nutrition Guidance', tagline: 'Meal recommendations for your goals',  Icon: Apple },
  { id: 'progress',  label: 'Progress',  title: 'Progress Tracking',  tagline: 'Track your recovery journey',          Icon: LineChart },
] as const

// Orden progresivo de fases (igual al del assessment)
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

type PlanExercise = {
  id: string
  name: string
  phase: string | null
  target_muscle: string | null
  youtube_url: string | null
}

export default function DashboardPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'active' | 'free'>('free')
  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading] = useState(true)

  // Splash de inicio
  const [minTime, setMinTime] = useState(false)
  const [splashGone, setSplashGone] = useState(false)
  const [logoIn, setLogoIn] = useState(false)

  // Tab "My Recovery Plan"
  const [planState, setPlanState] =
    useState<'idle' | 'loading' | 'loaded' | 'empty' | 'error'>('idle')
  const [planExercises, setPlanExercises] = useState<PlanExercise[]>([])
  const [planSummary, setPlanSummary] = useState('')
  const [planArea, setPlanArea] = useState('')

  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }
      setEmail(session.user.email || '')
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', session.user.id)
        .single()
      setStatus(profile?.subscription_status === 'active' ? 'active' : 'free')
      setLoading(false)
    }
    checkUser()
  }, [router])

  // Splash: el logo entra suave (~2s) y luego se desvanece hacia el dashboard
  useEffect(() => {
    const t1 = setTimeout(() => setLogoIn(true), 50)
    const t2 = setTimeout(() => setMinTime(true), 2000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const ready = !loading && minTime

  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => setSplashGone(true), 700)
      return () => clearTimeout(t)
    }
  }, [ready])

  // Cargar el plan del usuario la primera vez que abre el tab "Plan"
  useEffect(() => {
    if (activeTab === 'plan' && planState === 'idle') {
      loadPlan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  async function loadPlan() {
    setPlanState('loading')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setPlanState('empty'); return }

      // 1. El plan guardado del usuario
      const { data: plan, error: planErr } = await supabase
        .from('recovery_plans')
        .select('area, summary, exercise_ids')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (planErr) { console.error('Plan error:', planErr.message); setPlanState('error'); return }

      const ids: string[] = (plan?.exercise_ids as string[]) || []
      if (!plan || ids.length === 0) { setPlanState('empty'); return }

      setPlanSummary(plan.summary || '')
      setPlanArea(plan.area || '')

      // 2. Traer esos ejercicios de la biblioteca
      const { data: exercises, error: exErr } = await supabase
        .from('exercises')
        .select('id, name, phase, target_muscle, youtube_url')
        .in('id', ids)

      if (exErr) { console.error('Exercises error:', exErr.message); setPlanState('error'); return }

      // 3. Ordenar por fase progresiva
      const sorted = [...(exercises || [])].sort(
        (a, b) => (PHASE_ORDER[a.phase || ''] || 99) - (PHASE_ORDER[b.phase || ''] || 99)
      )

      setPlanExercises(sorted as PlanExercise[])
      setPlanState('loaded')
    } catch (e) {
      console.error(e)
      setPlanState('error')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const current = TABS.find(t => t.id === activeTab)!

  // Agrupar los ejercicios por fase (ya vienen ordenados)
  const withVideo = planExercises.filter(e => e.youtube_url).length
  const phaseGroups: { phase: string; items: PlanExercise[] }[] = []
  for (const ex of planExercises) {
    const phaseName = ex.phase || 'Additional Exercises'
    let g = phaseGroups.find(x => x.phase === phaseName)
    if (!g) { g = { phase: phaseName, items: [] }; phaseGroups.push(g) }
    g.items.push(ex)
  }

  return (
    <div className='min-h-screen bg-[#0A0A0A]'>

      {/* Splash de inicio — logo Alkeme sobre fondo negro, se desvanece solo */}
      {!splashGone && (
        <div className={`fixed inset-0 z-[100] bg-[#0A0A0A] flex items-center justify-center
          transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}>
          <img
            src='https://alkemesportsrx.com/wp-content/uploads/2026/06/Alkeme-Color-Logo.webp'
            alt='Alkeme Sports Rx'
            className={`w-52 object-contain drop-shadow-[0_0_30px_rgba(201,168,76,0.25)]
              transition-all duration-700 ease-out ${
              logoIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        </div>
      )}

      {/* Nav */}
      <nav className='flex items-center justify-between px-6 md:px-10 py-4
        border-b border-[#1A1A1A]'>
        <Link href='/' title='Go to home'>
          <img
            src='https://alkemesportsrx.com/wp-content/uploads/2026/06/Alkeme-Color-Logo.webp'
            alt='Alkeme'
            className='h-8 object-contain cursor-pointer hover:opacity-80 transition-opacity' />
        </Link>
        <button onClick={handleLogout}
          className='text-[#888] hover:text-white text-sm transition-colors'>
          Sign out
        </button>
      </nav>

      {status === 'free' ? (
        /* ---------- VISTA FREE ---------- */
        <div className='max-w-2xl mx-auto px-6 py-24 text-center'>
          <p className='text-[#C9A84C] text-xs tracking-[0.3em] font-semibold mb-3 uppercase'>
            Members Only
          </p>
          <h1 className='font-[Barlow_Condensed] text-5xl font-bold text-white mb-4'>
            UNLOCK YOUR FULL PLAN
          </h1>
          <p className='text-[#888] mb-10 leading-relaxed'>
            Your recovery plan, video library, nutrition guidance, and progress
            tracking are available with an active membership. Take your
            assessment to see your plan and get started.
          </p>
          <button
            onClick={() => router.push('/assessment')}
            className='bg-[#C9A84C] hover:bg-[#E8C96A] text-black
              font-[Barlow_Condensed] font-bold text-lg px-8 py-3 rounded-lg
              transition-all tracking-wide
              hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]'>
            TAKE ASSESSMENT →
          </button>
          <p className='text-[#555] text-xs mt-8'>Signed in as {email}</p>
        </div>
      ) : (
        /* ---------- VISTA ACTIVE: app con tabs ---------- */
        <>
          <div className='max-w-4xl mx-auto px-6 pt-12'
            style={{ paddingBottom: 'calc(120px + env(safe-area-inset-bottom))' }}>

            {activeTab === 'home' ? (
              /* ===== HOME ===== */
              <>
                <p className='text-[#C9A84C] text-xs tracking-[0.3em] font-semibold mb-3 uppercase'>
                  Your Dashboard
                </p>
                <h1 className='font-[Barlow_Condensed] text-5xl font-bold text-white mb-3'>
                  WELCOME BACK
                </h1>
                <p className='text-[#666] mb-8'>Signed in as {email}</p>

                <div className='grid md:grid-cols-2 gap-4'>
                  {TABS.filter(t => t.id !== 'home').map(card => (
                    <button key={card.id}
                      onClick={() => setActiveTab(card.id)}
                      className='bg-[#111] border border-[#1A1A1A] hover:border-[#C9A84C]/30
                        rounded-xl p-6 text-left transition-all group'>
                      <div className='flex items-start justify-between'>
                        <h3 style={{ color: '#FFFFFF' }}
                          className='font-[Barlow_Condensed] text-xl font-bold mb-2'>
                          {card.title}
                        </h3>
                        <span className='text-[#C9A84C] opacity-0 group-hover:opacity-100
                          transition-opacity'>→</span>
                      </div>
                      <p style={{ color: '#CCCCCC' }} className='text-sm'>{card.tagline}.</p>
                    </button>
                  ))}
                </div>
              </>
            ) : activeTab === 'plan' ? (
              /* ===== MY RECOVERY PLAN ===== */
              <>
                <p className='text-[#C9A84C] text-xs tracking-[0.3em] font-semibold mb-3 uppercase'>
                  My Recovery Plan
                </p>
                <h1 className='font-[Barlow_Condensed] text-4xl font-bold text-white mb-3'>
                  {planArea ? `YOUR ${planArea.toUpperCase()} PLAN` : 'YOUR RECOVERY PLAN'}
                </h1>

                {planState === 'loading' && (
                  <div className='flex justify-center py-16'>
                    <div className='flex gap-1.5'>
                      {[0, 150, 300].map(d => (
                        <span key={d} className='w-2 h-2 bg-[#C9A84C] rounded-full animate-bounce'
                          style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                )}

                {planState === 'error' && (
                  <div className='text-center py-16'>
                    <p className='text-[#888] mb-4'>We couldn&apos;t load your plan.</p>
                    <button onClick={loadPlan}
                      className='bg-[#C9A84C] hover:bg-[#E8C96A] text-black font-bold text-sm
                        px-5 py-2.5 rounded-lg transition-colors'>
                      Try again
                    </button>
                  </div>
                )}

                {planState === 'empty' && (
                  <div className='text-center py-16'>
                    <p className='text-[#888] max-w-sm mx-auto leading-relaxed'>
                      You don&apos;t have a recovery plan yet. Complete your assessment
                      to generate your personalized plan.
                    </p>
                  </div>
                )}

                {planState === 'loaded' && (
                  <>
                    {planSummary && (
                      <p className='text-[#A0A0A0] text-sm leading-relaxed mb-4 max-w-xl'>
                        {planSummary}
                      </p>
                    )}
                    <p className='text-[#555] text-xs uppercase tracking-wider mb-8'>
                      {planExercises.length} exercises · {withVideo} with video
                    </p>

                    {phaseGroups.map(group => (
                      <div key={group.phase} className='mb-8'>
                        <div className='mb-3'>
                          <h3 className='font-[Barlow_Condensed] text-2xl font-bold text-white'>
                            {group.phase}
                          </h3>
                          <div className='w-8 h-0.5 bg-[#C9A84C] rounded-full mt-1' />
                        </div>
                        <div className='space-y-2'>
                          {group.items.map(ex => (
                            <div key={ex.id}
                              className='bg-[#111] border border-[#1A1A1A] rounded-xl p-4
                                flex items-center justify-between gap-3'>
                              <div className='min-w-0'>
                                <p className='text-white font-semibold text-sm'>{ex.name}</p>
                                {ex.target_muscle && (
                                  <p className='text-[#888] text-xs mt-0.5'>{ex.target_muscle}</p>
                                )}
                              </div>
                              {ex.youtube_url ? (
                                <a href={ex.youtube_url} target='_blank' rel='noopener noreferrer'
                                  className='shrink-0 bg-[#C9A84C] hover:bg-[#E8C96A] text-black
                                    text-xs font-bold px-3 py-2 rounded-lg transition-colors
                                    whitespace-nowrap'>
                                  Watch video
                                </a>
                              ) : (
                                <span className='shrink-0 text-[#555] text-xs italic whitespace-nowrap'>
                                  Video coming soon
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            ) : (
              /* ===== OTROS TABS (Videos, Nutrition, Progress) — placeholder ===== */
              <div className='min-h-[55vh] flex flex-col items-center justify-center text-center'>
                <p className='text-[#C9A84C] text-xs tracking-[0.3em] font-semibold mb-3 uppercase'>
                  {current.label}
                </p>
                <h1 className='font-[Barlow_Condensed] text-5xl font-bold text-white mb-4'>
                  {current.title}
                </h1>
                <div className='w-10 h-0.5 bg-[#C9A84C] rounded-full mb-5' />
                <p className='text-[#666] max-w-sm leading-relaxed mb-3'>
                  {current.tagline}.
                </p>
                <p className='text-[#444] text-sm uppercase tracking-[0.3em]'>
                  Coming soon
                </p>
              </div>
            )}
          </div>

          {/* Barra de tabs inferior — sólida, a todo el ancho, botones grandes */}
          <div
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, width: '100%',
              backgroundColor: '#161616', borderTop: '1px solid #2A2A2A',
              boxShadow: '0 -6px 24px rgba(0,0,0,0.6)', zIndex: 50,
              paddingBottom: 'env(safe-area-inset-bottom)'
            }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', width: '100%' }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.id
                const Icon = tab.Icon
                return (
                  <button key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ width: '100%' }}
                    className={`flex flex-col items-center justify-center gap-1.5 py-4
                      transition-colors ${
                      isActive ? 'text-[#C9A84C]' : 'text-[#666] hover:text-[#999]'
                    }`}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    <span className='font-[Barlow_Condensed] font-bold text-[11px] sm:text-xs
                      tracking-wide uppercase'>
                      {tab.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}