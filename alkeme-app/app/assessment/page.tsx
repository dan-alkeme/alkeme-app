'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ChatAssessment from '../components/ChatAssessment'

export default function AssessmentPage() {
  const [checking, setChecking] = useState(true)
  const [phase, setPhase] = useState<'intro' | 'chat'>('intro')
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  // Guardián: los suscriptores activos no deben ver el assessment
  useEffect(() => {
    async function checkSubscription() {
      const { data: { session } } = await supabase.auth.getSession()

      // Solo bloqueamos a los 'active'. Visitantes y 'free' pueden continuar.
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', session.user.id)
          .single()

        if (profile?.subscription_status === 'active') {
          router.replace('/dashboard')
          return
        }
      }

      setChecking(false)
    }
    checkSubscription()
  }, [router])

  // La barra de carga solo arranca cuando ya pasó el guardián
  useEffect(() => {
    if (checking) return
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => setPhase('chat'), 200)
            return 100
          }
          return prev + 4
        })
      }, 50)
    }, 400)
    return () => clearTimeout(start)
  }, [checking])

  // Mientras verifica la suscripción, un loader sobrio (evita el "parpadeo")
  if (checking) {
    return (
      <div className='h-screen bg-[#0A0A0A] flex items-center justify-center'>
        <div className='flex gap-1.5'>
          {[0, 150, 300].map(d => (
            <span key={d} className='w-2 h-2 bg-[#C9A84C] rounded-full animate-bounce'
              style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'chat') {
    return <ChatAssessment onBack={() => setPhase('intro')} />
  }

  return (
    <div className='h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4'>
      <div className='flex flex-col items-center gap-8 w-full max-w-xs'>

        {/* Logo */}
        <img
          src='https://alkemesportsrx.com/wp-content/uploads/2026/06/Alkeme-Color-Logo.webp'
          alt='Alkeme Sports Rx'
          className='w-44 object-contain'
        />

        {/* Text */}
        <div className='text-center'>
          <p className='font-[Barlow_Condensed] text-2xl font-bold text-white mb-1'>
            BUILDING YOUR PERSONALIZED PLAN
          </p>
          <p className='text-[#555] text-sm'>
            Powered by Alkeme Sports Rx AI
          </p>
        </div>

        {/* Loading bar */}
        <div className='w-full'>
          <div className='h-1 bg-[#1A1A1A] rounded-full overflow-hidden'>
            <div
              className='h-full bg-[#C9A84C] rounded-full transition-all duration-75'
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className='flex justify-between text-[#333] text-xs mt-2'>
            <span>Analyzing your profile</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}