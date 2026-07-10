'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TABS = [
  { id: 'home',      label: 'Home',      title: 'Welcome Back',       tagline: '' },
  { id: 'plan',      label: 'Plan',      title: 'My Recovery Plan',   tagline: 'Your personalized exercise program' },
  { id: 'videos',    label: 'Videos',    title: 'Video Library',      tagline: 'Guided exercise videos for your plan' },
  { id: 'nutrition', label: 'Nutrition', title: 'Nutrition Guidance', tagline: 'Meal recommendations for your goals' },
  { id: 'progress',  label: 'Progress',  title: 'Progress Tracking',  tagline: 'Track your recovery journey' },
] as const

export default function DashboardPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'active' | 'free'>('free')
  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading] = useState(true)

  // Splash de inicio
  const [minTime, setMinTime] = useState(false)
  const [splashGone, setSplashGone] = useState(false)
  const [logoIn, setLogoIn] = useState(false)

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

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const current = TABS.find(t => t.id === activeTab)!

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
          <div className='max-w-4xl mx-auto px-6 py-12 pb-28'>

            {activeTab === 'home' ? (
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
                        <h3 className='font-[Barlow_Condensed] text-xl font-bold text-white mb-2'>
                          {card.title}
                        </h3>
                        <span className='text-[#C9A84C] opacity-0 group-hover:opacity-100
                          transition-opacity'>→</span>
                      </div>
                      <p className='text-white text-sm'>{card.tagline}.</p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
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

          {/* Barra de tabs inferior (pulida, resaltado del activo) */}
          <div className='fixed bottom-0 left-0 right-0 bg-[#0D0D0D]/95 backdrop-blur-sm
            border-t border-[#1A1A1A] z-50'>
            <div className='max-w-4xl mx-auto grid grid-cols-5 py-2.5'>
              {TABS.map(tab => {
                const isActive = activeTab === tab.id
                return (
                  <button key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className='flex items-center justify-center py-1'>
                    <span className={`font-[Barlow_Condensed] font-bold whitespace-nowrap
                      text-[11px] sm:text-sm tracking-wide uppercase rounded-full
                      px-2.5 py-1.5 transition-all duration-200 ${
                      isActive
                        ? 'text-[#C9A84C] bg-[#C9A84C]/10'
                        : 'text-[#666] hover:text-[#999]'
                    }`}>
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