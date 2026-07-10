'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const STATS = [
  { value: '98%',   label: 'Return-to-Play Rate' },
  { value: '3.4x',  label: 'Faster Recovery' },
  { value: '<9 mo', label: 'ACL Return Timeline' },
  { value: '25%',   label: 'Quad Strength Gain' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Tell us what you want to work on',
    desc: 'Select your target area and goal — no medical jargon, no complicated intake forms.'
  },
  {
    step: '02',
    title: 'Our AI builds your plan',
    desc: 'Alkeme AI asks one targeted follow-up question, then selects the right exercises for your protocol.'
  },
  {
    step: '03',
    title: 'Follow guided video exercises',
    desc: 'Watch clinician-approved video guidance and track your recovery from any device.'
  },
]

const ATHLETES = [
  { name: 'Stefon Diggs',   team: 'WR · Houston Texans',        quote: '"Dr. Tabbah got me back on the field faster than I ever thought possible."' },
  { name: 'Antonio Gibson', team: 'RB · New England Patriots',   quote: '"The rehab program here was unlike anything I had experienced before."' },
  { name: 'Malik Nabers',   team: 'WR · New York Giants',        quote: '"Alkeme\'s approach to recovery completely changed the game for me."' },
  { name: 'Kenny McIntosh', team: 'RB · Jacksonville Jaguars',   quote: '"I came back stronger than I was before the injury. That says it all."' },
]

const FEATURES = [
  { title: 'Phased Protocols',      desc: 'Progressive programs that evolve as you improve — not a static exercise list.' },
  { title: 'Video Guidance',        desc: 'Every exercise links to a clinician-filmed demonstration video.' },
  { title: 'AI-Powered Intake',     desc: 'Skip the generic questionnaire. Our AI asks what actually matters.' },
  { title: 'Adaptive Plans',        desc: 'Your plan adjusts based on your goals, timeline and activity level.' },
]

export default function LandingPage() {
  const [activeAthlete, setActiveAthlete] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [floatingVisible, setFloatingVisible] = useState(true)
  const [floatingMinimized, setFloatingMinimized] = useState(false)
  // Splash de entrada (negro → logo → landing)
  const [showSplash, setShowSplash] = useState(true)
  const [logoVisible, setLogoVisible] = useState(false)
  const [splashFadeOut, setSplashFadeOut] = useState(false)

  function handleMinimize() {
    setFloatingMinimized(true)
    setTimeout(() => { setFloatingMinimized(false); setFloatingVisible(true) }, 20000)
  }

  function handleClose() {
    setFloatingVisible(false)
    setTimeout(() => { setFloatingVisible(true); setFloatingMinimized(false) }, 20000)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAthlete(prev => (prev + 1) % ATHLETES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', session.user.id)
          .single()
        setIsSubscribed(profile?.subscription_status === 'active')
      }
      setAuthChecked(true)
    }
    checkAuth()
  }, [])
  // Splash: 1s en negro, el logo aparece en 3s, luego la capa se desvanece
  useEffect(() => {
    const t1 = setTimeout(() => setLogoVisible(true), 1000)   // arranca el fade-in del logo
    const t2 = setTimeout(() => setSplashFadeOut(true), 4000) // empieza a desvanecer la capa negra
    const t3 = setTimeout(() => setShowSplash(false), 4800)   // la quita del todo
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <main className='bg-[#0A0A0A] text-white min-h-screen font-[Barlow]'>
      {/* Splash de entrada — negro, luego el logo aparece poco a poco */}
      {showSplash && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#0A0A0A', zIndex: 10000
          }}
          className={`transition-opacity duration-700 ${splashFadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <img
            src='https://alkemesportsrx.com/wp-content/uploads/2026/06/Alkeme-Color-Logo.webp'
            alt='Alkeme Sports Rx'
            className={`w-48 sm:w-56 md:w-64 object-contain
              drop-shadow-[0_0_35px_rgba(201,168,76,0.25)]
              transition-all ease-out ${logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{ transitionDuration: '3000ms' }}
          />
        </div>
      )}

      {/* TOP BAR — Auth */}
      <div className='fixed top-0 right-0 z-50 flex items-center gap-3 px-6 py-4'>
        {isLoggedIn ? (
          <Link href='/dashboard'
            className='bg-[#C9A84C] hover:bg-[#E8C96A] text-black font-[Barlow_Condensed]
              font-bold text-sm px-4 py-2 rounded-lg transition-all tracking-wide'>
            DASHBOARD
          </Link>
        ) : (
          <>
            <Link href='/auth/login'
              className='text-[#A0A0A0] hover:text-white text-sm font-semibold
                transition-colors px-3 py-2'>
              Sign In
            </Link>
            <Link href='/auth/signup'
              className='bg-[#C9A84C] hover:bg-[#E8C96A] text-black font-[Barlow_Condensed]
                font-bold text-sm px-4 py-2 rounded-lg transition-all tracking-wide'>
              SIGN UP
            </Link>
          </>
        )}
      </div>

      {/* HERO */}
      <section className='pt-40 pb-24 px-6 md:px-10 max-w-5xl mx-auto'>
        <p className='text-[#C9A84C] text-xs tracking-[0.3em] font-semibold mb-4 uppercase'>
          AI-Powered Athletic Rehabilitation
        </p>
        <h1 className='font-[Barlow_Condensed] text-6xl md:text-8xl font-extrabold
          leading-none mb-6 max-w-3xl'>
          GET BACK TO DOING<br />
          <span className='text-[#C9A84C]'>WHAT YOU LOVE.</span>
        </h1>
        <p className='text-[#888] text-lg md:text-xl max-w-xl mb-10 leading-relaxed'>
          Your personalized rehab plan is waiting. Built on the same science
          that got pro athletes back on the field — now available for everyone.
        </p>
        <div className='flex flex-col sm:flex-row gap-4'>
          {isSubscribed ? (
            <Link href='/dashboard'
              className='inline-block bg-[#C9A84C] hover:bg-[#E8C96A] text-black
                font-[Barlow_Condensed] font-bold text-xl px-10 py-4 rounded-lg
                transition-all hover:scale-105
                hover:shadow-[0_0_40px_rgba(201,168,76,0.35)] tracking-wide text-center'>
              GO TO DASHBOARD
            </Link>
          ) : (
            <>
              <Link href='/assessment'
                className='inline-block bg-[#C9A84C] hover:bg-[#E8C96A] text-black
                  font-[Barlow_Condensed] font-bold text-xl px-10 py-4 rounded-lg
                  transition-all hover:scale-105
                  hover:shadow-[0_0_40px_rgba(201,168,76,0.35)] tracking-wide text-center'>
                BUILD MY RECOVERY PLAN
              </Link>
              <p className='text-[#444] text-sm self-center'>
                Free to start · No equipment required for early phases
              </p>
            </>
          )}
        </div>
      </section>

      {/* STATS */}
      <section className='px-6 md:px-10 pb-20 max-w-5xl mx-auto'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {STATS.map(s => (
            <div key={s.label}
              className='bg-[#111] border border-[#1E1E1E] rounded-xl p-5 text-center
                hover:border-[#C9A84C]/30 transition-all'>
              <p className='font-[Barlow_Condensed] text-4xl font-bold text-[#C9A84C] mb-1'>
                {s.value}
              </p>
              <p className='text-[#555] text-xs uppercase tracking-wider'>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className='px-6 md:px-10 pb-24 max-w-5xl mx-auto'>
        <p className='text-[#C9A84C] text-xs tracking-[0.2em] font-semibold mb-3 uppercase'>
          Why Alkeme
        </p>
        <h2 className='font-[Barlow_Condensed] text-5xl font-bold mb-12'>
          NOT JUST ANOTHER<br />
          <span className='text-[#C9A84C]'>EXERCISE APP.</span>
        </h2>
        <div className='grid md:grid-cols-2 gap-5'>
          {[
            {
              title: 'Clinician-designed protocols',
              desc: 'Every program is built by the physical therapists behind some of the fastest NFL recoveries on record — not generic content or algorithms.'
            },
            {
              title: 'Phased progression',
              desc: 'Your plan moves through structured phases as you improve. You never repeat the same routine for weeks — the program evolves with you.'
            },
            {
              title: 'Video-guided every step',
              desc: 'No guessing how an exercise is done. Every movement links to a clinician-filmed demonstration you can follow from any device.'
            },
            {
              title: 'Built for real people',
              desc: 'Designed for everyday injuries — not just elite athletes. Whether you\'re recovering from surgery or chronic pain, your plan fits your life.'
            },
          ].map(b => (
            <div key={b.title}
              className='bg-[#111] border border-[#1E1E1E] hover:border-[#C9A84C]/20
                rounded-xl p-6 transition-all group'>
              <div className='w-8 h-0.5 bg-[#C9A84C] rounded-full mb-4
                group-hover:w-12 transition-all duration-300' />
              <h3 className='font-[Barlow_Condensed] text-xl font-bold text-white mb-2'>
                {b.title}
              </h3>
              <p className='text-[#555] text-sm leading-relaxed'>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className='px-6 md:px-10 pb-24 max-w-5xl mx-auto border-t border-[#1A1A1A] pt-20'>
        <p className='text-[#C9A84C] text-xs tracking-[0.2em] font-semibold mb-3 uppercase'>
          Simple process
        </p>
        <h2 className='font-[Barlow_Condensed] text-5xl font-bold mb-12'>
          HOW IT <span className='text-[#C9A84C]'>WORKS</span>
        </h2>
        <div className='grid md:grid-cols-3 gap-6'>
          {HOW_IT_WORKS.map(h => (
            <div key={h.step}
              className='bg-[#111] border border-[#1E1E1E] hover:border-[#C9A84C]/20
                rounded-xl p-6 transition-all'>
              <p className='font-[Barlow_Condensed] text-6xl font-bold
                text-[#C9A84C]/15 mb-4 leading-none'>
                {h.step}
              </p>
              <h3 className='font-[Barlow_Condensed] text-xl font-bold text-white mb-2'>
                {h.title}
              </h3>
              <p className='text-[#555] text-sm leading-relaxed'>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className='px-6 md:px-10 pb-24 max-w-5xl mx-auto'>
        <p className='text-[#C9A84C] text-xs tracking-[0.2em] font-semibold mb-3 uppercase'>
          Built for recovery
        </p>
        <h2 className='font-[Barlow_Condensed] text-5xl font-bold mb-12'>
          EVERYTHING YOU NEED
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {FEATURES.map(f => (
            <div key={f.title}
              className='bg-[#111] border border-[#1E1E1E] hover:border-[#C9A84C]/20
                rounded-xl p-5 transition-all'>
              <div className='w-8 h-1 bg-[#C9A84C] rounded-full mb-4' />
              <h3 className='font-[Barlow_Condensed] text-lg font-bold text-white mb-2'>
                {f.title}
              </h3>
              <p className='text-[#555] text-xs leading-relaxed'>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ATHLETES */}
      <section className='px-6 md:px-10 pb-24 max-w-5xl mx-auto border-t border-[#1A1A1A] pt-20'>
        <p className='text-[#444] text-xs tracking-[0.3em] uppercase mb-8 text-center'>
          Trusted by NFL Athletes
        </p>

        {/* Tarjeta contenedora de los testimonios (se ajusta sola a la altura) */}
        <div className='max-w-3xl mx-auto bg-[#111] border border-[#1E1E1E]
          rounded-2xl px-6 py-8 md:px-10 md:py-10'>
          <div className='grid'>
            {ATHLETES.map((a, i) => (
              <div key={a.name}
                style={{ gridArea: '1 / 1' }}
                className={`flex flex-col items-center justify-center text-center px-2
                  transition-all duration-700 ${
                  i === activeAthlete
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }`}>
                <p className='text-white text-base sm:text-lg md:text-xl italic mb-4
                  leading-relaxed'>
                  {a.quote}
                </p>
                <p className='font-[Barlow_Condensed] font-bold text-[#C9A84C] tracking-wider'>
                  {a.name}
                  <span className='text-[#444] font-normal'> · {a.team}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Puntitos de navegación */}
          <div className='flex justify-center gap-2 mt-6'>
            {ATHLETES.map((_, i) => (
              <button key={i} onClick={() => setActiveAthlete(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeAthlete ? 'w-8 bg-[#C9A84C]' : 'w-2 bg-[#333]'
                }`} />
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className='px-6 md:px-10 pb-24 max-w-5xl mx-auto border-t border-[#1A1A1A] pt-20 text-center'>
        <p className='text-[#C9A84C] text-xs tracking-[0.3em] font-semibold mb-4 uppercase'>
          Start today
        </p>
        <h2 className='font-[Barlow_Condensed] text-5xl md:text-6xl font-bold mb-4'>
          FULL STRENGTH<br />STARTS HERE.
        </h2>
        {isSubscribed ? (
          <>
            <p className='text-[#666] max-w-md mx-auto mb-10 leading-relaxed'>
              Your recovery plan and progress are waiting in your dashboard.
            </p>
            <Link href='/dashboard'
              className='inline-block bg-[#C9A84C] hover:bg-[#E8C96A] text-black
                font-[Barlow_Condensed] font-bold text-2xl px-12 py-5 rounded-xl
                transition-all hover:scale-105
                hover:shadow-[0_0_40px_rgba(201,168,76,0.35)] tracking-wide'>
              GO TO DASHBOARD
            </Link>
          </>
        ) : (
          <>
            <p className='text-[#666] max-w-md mx-auto mb-10 leading-relaxed'>
              Answer a few questions about your injury and goals — we build a guided
              plan that adjusts as you progress.
            </p>
            <Link href='/assessment'
              className='inline-block bg-[#C9A84C] hover:bg-[#E8C96A] text-black
                font-[Barlow_Condensed] font-bold text-2xl px-12 py-5 rounded-xl
                transition-all hover:scale-105
                hover:shadow-[0_0_40px_rgba(201,168,76,0.35)] tracking-wide'>
              BUILD MY RECOVERY PLAN
            </Link>
            <p className='text-[#333] text-xs mt-4'>
              Free to start · No credit card required
            </p>
          </>
        )}
      </section>

      {/* FOOTER */}
      <footer className='border-t border-[#1A1A1A] px-6 md:px-10 py-8
        max-w-5xl mx-auto flex flex-col md:flex-row items-center
        justify-between gap-4'>
        <img
          src='https://alkemesportsrx.com/wp-content/uploads/2026/06/Alkeme-Color-Logo.webp'
          alt='Alkeme Sports Rx'
          className='h-7 object-contain'
        />
        <div className='text-center'>
          <p className='text-[#333] text-xs'>
            © 2025 Alkeme Sports Rx · Miami & Davie, FL · Founded by Dr. Sharif Tabbah
          </p>
          <p className='text-[#222] text-xs mt-1'>
            This app provides exercise guidance only and does not constitute medical advice.
          </p>
        </div>
        {isSubscribed ? (
          <Link href='/dashboard'
            className='text-[#C9A84C] text-sm font-semibold hover:underline'>
            Go to Dashboard
          </Link>
        ) : (
          <Link href='/assessment'
            className='text-[#C9A84C] text-sm font-semibold hover:underline'>
            Start Assessment
          </Link>
        )}
      </footer>

      {/* Floating CTA — solo para visitantes y usuarios free (versión compacta) */}
      {authChecked && !isSubscribed && floatingVisible && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}
          className='flex flex-col items-start gap-2'>
          {!floatingMinimized ? (
            <div className='bg-[#141414] border border-[#C9A84C]/30 rounded-lg
              shadow-[0_0_18px_rgba(201,168,76,0.2)] px-2.5 py-1.5 flex items-center gap-2'>
              <img
                src='https://alkemesportsrx.com/wp-content/uploads/2026/06/Alkeme-Color-Logo.webp'
                alt='Alkeme'
                className='h-4 object-contain'
              />
              <div className='w-px h-4 bg-[#2A2A2A]' />
              <Link href='/assessment'
                className='text-[#C9A84C] font-[Barlow_Condensed] font-bold text-[11px]
                  tracking-wide whitespace-nowrap hover:text-[#E8C96A] transition-colors'>
                BUILD MY PLAN
              </Link>
              <div className='flex gap-0.5'>
                <button onClick={handleMinimize}
                  className='text-[#444] hover:text-white transition-colors font-bold
                    text-xs leading-none px-1'>
                  —
                </button>
                <button onClick={handleClose}
                  className='text-[#444] hover:text-white transition-colors font-bold
                    text-xs leading-none px-1'>
                  ×
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setFloatingMinimized(false); setFloatingVisible(true) }}
              style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 9999 }}
              className='bg-[#141414] border border-[#C9A84C]/30 w-9 h-9 rounded-full
                flex items-center justify-center
                shadow-[0_0_15px_rgba(201,168,76,0.2)] hover:border-[#C9A84C]
                transition-all'>
              <span className='text-[#C9A84C] font-bold text-base leading-none'>+</span>
            </button>
          )}
        </div>
      )}
    </main>
  )
}