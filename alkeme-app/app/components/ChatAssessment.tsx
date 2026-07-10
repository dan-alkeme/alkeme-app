'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const AREAS = [
  'Knee', 'Shoulder', 'Lower Back', 'Hip',
  'Ankle / Foot', 'Elbow', 'Neck', 'Wrist / Hand',
  'Core & Spine', 'Full Body'
]
const GOALS = [
  'Return to sport', 'Build strength',
  'Restore range of motion', 'Get back to daily life', 'Reduce discomfort'
]
const DURATIONS = ['Just starting out', '1–4 weeks', '1–3 months', '3+ months']

type Message = {
  id: string
  role: 'ai' | 'user'
  text: string
  options?: string[]
  answered: boolean
}

export default function ChatAssessment({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const initialized = useRef(false)
  const [area, setArea] = useState('')
  const [goal, setGoal] = useState('')
  const [duration, setDuration] = useState('')
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [planData, setPlanData] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    showTyping(() => addAiMessage('q1',
      "Hey, I'm your Alkeme recovery coach. Let's build your personalized plan.\n\nWhat area do you want to strengthen?",
      AREAS), 800)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing, loading])

  function showTyping(cb: () => void, delay = 900) {
    setTyping(true)
    setTimeout(() => { setTyping(false); cb() }, delay)
  }

  function addAiMessage(id: string, text: string, options?: string[]) {
    setMessages(prev => [...prev, { id, role: 'ai', text, options, answered: false }])
  }

  function addUserMessage(text: string) {
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`, role: 'user', text, answered: true
    }])
  }

  function markAnswered(id: string) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, answered: true } : m))
  }

  function handleArea(value: string) {
    setArea(value); markAnswered('q1'); addUserMessage(value); setCurrentStep(1)
    showTyping(() => addAiMessage('q2', 'What is your main goal right now?', GOALS))
  }

  function handleGoal(value: string) {
    setGoal(value); markAnswered('q2'); addUserMessage(value); setCurrentStep(2)
    showTyping(() => addAiMessage('q3', 'How long have you been working on this?', DURATIONS))
  }

  async function handleDuration(value: string) {
    setDuration(value); markAnswered('q3'); addUserMessage(value)
    setCurrentStep(3); setLoading(true)
    try {
      const res = await fetch('/api/symptoms/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area, goal, duration: value })
      })
      const data = await res.json()
      setLoading(false)
      showTyping(() => addAiMessage('q4', data.question, data.options))
    } catch { setLoading(false) }
  }

  async function handleAiAnswer(value: string) {
    markAnswered('q4'); addUserMessage(value)
    setCurrentStep(4); setLoading(true)
    try {
      const res = await fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area, goal, duration, aiAnswer: value })
      })
      const data = await res.json()
      setPlanData(data)
      setLoading(false); setShowResults(true)
    } catch { setLoading(false) }
  }
async function handleSubscribe(priceId: string | undefined) {
  if (!priceId) return

  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Not logged in — send to signup, remember they wanted to subscribe
    router.push('/auth/signup?redirect=assessment')
    return
  }

  // Guardar (o actualizar) el plan del usuario ANTES de ir a Stripe
  if (planData) {
    const { error: planError } = await supabase
      .from('recovery_plans')
      .upsert({
        user_id: session.user.id,
        area: planData.area,
        goal: goal,
        summary: planData.summary,
        exercise_ids: planData.exerciseIds || [],
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (planError) {
      console.error('Error guardando el plan:', planError.message)
    }
  }

  // Logged in — proceed to Stripe checkout with their user info
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId,
      userId: session.user.id,
      userEmail: session.user.email
    })
  })
  const { url } = await res.json()
  if (url) window.location.href = url
}
  function reset() {
    setMessages([]); setArea(''); setGoal(''); setDuration('')
    setPlanData(null); setShowResults(false); setCurrentStep(0)
    initialized.current = false
    showTyping(() => addAiMessage('q1',
      "Hey, I'm your Alkeme recovery coach. Let's build your personalized plan.\n\nWhat area do you want to strengthen?",
      AREAS), 800)
    initialized.current = true
  }

  // ============= RESULTS SCREEN — SUBSCRIPTION OFFER =============
  if (showResults && planData) {
    return (
      <div className='min-h-screen bg-[#0A0A0A] px-4 py-8 flex flex-col items-center'>
        <div className='w-full max-w-xl'>

          {/* Logo */}
          <div className='flex justify-center mb-8'>
            <img src='https://alkemesportsrx.com/wp-content/uploads/2026/06/Alkeme-Color-Logo.webp'
              alt='Alkeme' className='h-8 object-contain' />
          </div>

          {/* Plan ready badge */}
          <div className='text-center mb-6'>
            <span className='inline-block bg-[#C9A84C]/10 border border-[#C9A84C]/30
              text-[#C9A84C] text-xs font-semibold px-4 py-1.5 rounded-full
              tracking-widest mb-4'>
              YOUR PLAN IS READY
            </span>
            <h2 className='font-[Barlow_Condensed] text-4xl font-bold text-white mb-3'>
              YOUR {planData.area?.toUpperCase()} RECOVERY PLAN
            </h2>
            <p className='text-[#A0A0A0] text-sm leading-relaxed max-w-md mx-auto'>
              {planData.summary}
            </p>
          </div>

          {/* Plan stats */}
          <div className='grid grid-cols-2 gap-3 mb-8'>
            <div className='bg-[#141414] border border-[#1E1E1E] rounded-xl p-4 text-center'>
              <p className='font-[Barlow_Condensed] text-3xl font-bold text-[#C9A84C]'>
                {planData.totalExercises}
              </p>
              <p className='text-[#555] text-xs uppercase tracking-wider mt-1'>
                Targeted Exercises
              </p>
            </div>
            <div className='bg-[#141414] border border-[#1E1E1E] rounded-xl p-4 text-center'>
              <p className='font-[Barlow_Condensed] text-3xl font-bold text-[#C9A84C]'>
                {planData.phaseCount || 4}
              </p>
              <p className='text-[#555] text-xs uppercase tracking-wider mt-1'>
                Progressive Phases
              </p>
            </div>
          </div>

          {/* What's included */}
          <div className='mb-8'>
            <p className='text-[#C9A84C] text-xs tracking-[0.2em] font-semibold mb-4 uppercase'>
              What your membership unlocks
            </p>
            <div className='space-y-3'>
              {[
                { title: 'Guided video for every exercise', desc: 'Clinician-filmed demonstrations you follow step by step.' },
                { title: 'Phased progression', desc: 'Your plan advances through structured phases as you recover.' },
                { title: 'Personalized nutrition guidance', desc: 'Meal recommendations built around your recovery goals.' },
                { title: 'Progress & habit tracking', desc: 'Track your recovery, workouts and daily habits in one place.' },
              ].map(item => (
                <div key={item.title} className='flex gap-3 items-start
                  bg-[#111] border border-[#1A1A1A] rounded-xl p-4'>
                  <div className='w-5 h-5 rounded-full bg-[#C9A84C] flex items-center
                    justify-center shrink-0 mt-0.5'>
                    <span className='text-black text-xs font-bold'>✓</span>
                  </div>
                  <div>
                    <p className='text-white font-semibold text-sm'>{item.title}</p>
                    <p className='text-[#555] text-xs mt-0.5'>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <p className='text-[#C9A84C] text-xs tracking-[0.2em] font-semibold mb-4
            uppercase text-center'>
            Choose your plan
          </p>
<div className='space-y-3 mb-6'>
  {/* Quarterly - best value */}
  <button
    onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY)}
    className='w-full bg-[#C9A84C] rounded-xl p-5 text-left relative
      hover:bg-[#E8C96A] transition-all group'>
    <span className='absolute top-3 right-3 bg-black text-[#C9A84C]
      text-xs font-bold px-2 py-1 rounded-full'>BEST VALUE</span>
    <p className='text-black font-[Barlow_Condensed] font-bold text-2xl'>
      $149.99
      <span className='text-black/60 text-sm font-normal'> / 3 months</span>
    </p>
    <p className='text-black/70 text-sm mt-1'>
      Save 33% — just $50/month billed quarterly
    </p>
  </button>

  {/* Monthly */}
  <button
    onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY)}
    className='w-full bg-[#141414] border border-[#2A2A2A] rounded-xl p-5
      text-left hover:border-[#C9A84C]/50 transition-all'>
    <p className='text-white font-[Barlow_Condensed] font-bold text-2xl'>
      $74.99
      <span className='text-[#555] text-sm font-normal'> / month</span>
    </p>
    <p className='text-[#555] text-sm mt-1'>
      Billed monthly — cancel anytime
    </p>
  </button>
</div>
          <p className='text-[#333] text-xs text-center mb-6'>
            Secure payment via Stripe · Cancel anytime · No hidden fees
          </p>

          <button onClick={reset}
            className='w-full py-3 border border-[#C9A84C]/30 text-[#C9A84C]
              font-[Barlow_Condensed] font-bold rounded-lg hover:bg-[#C9A84C]/10
              transition-all'>
            RETAKE ASSESSMENT
          </button>
        </div>
      </div>
    )
  }

  // ============= CHAT SCREEN =============
  return (
    <div className='h-screen bg-[#0A0A0A] flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-4
        border-b border-[#1A1A1A] shrink-0'>
        <button onClick={onBack}
          className='text-[#555] hover:text-white transition-colors text-sm'>
          Back
        </button>
        <img src='https://alkemesportsrx.com/wp-content/uploads/2026/06/Alkeme-Color-Logo.webp'
          alt='Alkeme' className='h-7 object-contain' />
        <span className='bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C]
          text-xs font-semibold px-3 py-1 rounded-full tracking-wider'>
          AI ASSESSMENT
        </span>
      </div>

      {/* Progress */}
      <div className='flex justify-center gap-2 py-3 shrink-0'>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${
            i <= currentStep ? 'w-8 bg-[#C9A84C]' : 'w-2 bg-[#2A2A2A]'
          }`} />
        ))}
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto px-4 py-2 space-y-4'>
        {messages.map(msg => (
          <div key={msg.id}>
            {msg.role === 'ai' ? (
              <div className='max-w-xs md:max-w-sm'>
                <div className='bg-[#141414] border border-[#1E1E1E] rounded-2xl
                  rounded-tl-none p-4 mb-3'>
                  {msg.text.split('\n\n').map((part, i) => (
                    <p key={i} className={`${
                      i === 0 ? 'text-[#A0A0A0] text-sm' : 'text-white font-semibold mt-2'
                    }`}>
                      {part}
                    </p>
                  ))}
                </div>
                {msg.options && !msg.answered && (
                  <div className='flex flex-col gap-2'>
                    {msg.options.map(opt => (
                      <button key={opt}
                        onClick={() => {
                          if (msg.id === 'q1') handleArea(opt)
                          else if (msg.id === 'q2') handleGoal(opt)
                          else if (msg.id === 'q3') handleDuration(opt)
                          else if (msg.id === 'q4') handleAiAnswer(opt)
                        }}
                        className='w-full text-left px-4 py-3 rounded-xl border
                          border-[#2A2A2A] bg-[#141414] text-[#E8E8E8] text-sm
                          hover:border-[#C9A84C] hover:bg-[#C9A84C]/5
                          transition-all duration-150 active:scale-[0.98]'>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className='flex justify-end'>
                <div className='bg-[#C9A84C] text-black px-4 py-3 rounded-2xl
                  rounded-tr-none max-w-xs font-semibold text-sm'>
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}

        {(typing || loading) && (
          <div className='max-w-xs'>
            <div className='bg-[#141414] border border-[#1E1E1E] rounded-2xl
              rounded-tl-none p-4 inline-flex gap-1.5 items-center'>
              {[0, 150, 300].map(delay => (
                <span key={delay} className='w-2 h-2 bg-[#C9A84C] rounded-full animate-bounce'
                  style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
