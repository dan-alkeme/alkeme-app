'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className='min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <Link href='/'
          className='text-[#555] hover:text-white text-sm mb-8 inline-block transition-colors'>
          ← Back to home
        </Link>

        <div className='flex flex-col items-center mb-8'>
          <img
            src='https://alkemesportsrx.com/wp-content/uploads/2026/06/Alkeme-Color-Logo.webp'
            alt='Alkeme' className='h-10 object-contain' />
        </div>

        <h1 className='font-[Barlow_Condensed] text-4xl font-bold text-white text-center mb-2'>
          WELCOME BACK
        </h1>
        <p className='text-[#666] text-center mb-8'>Sign in to your recovery plan</p>

        {error && (
          <div className='bg-red-900/20 border border-red-500/30 text-red-400
            p-3 rounded-lg mb-4 text-sm'>{error}</div>
        )}

        <div className='flex flex-col gap-4'>
          <div>
            <label className='text-[#A0A0A0] text-sm mb-1.5 block'>Email</label>
            <input type='email' value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='your@email.com'
              className='w-full bg-[#141414] border border-[#2A2A2A] text-white px-4 py-3
                rounded-lg focus:outline-none focus:border-[#C9A84C] transition-colors' />
          </div>
          <div>
            <label className='text-[#A0A0A0] text-sm mb-1.5 block'>Password</label>
            <input type='password' value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='••••••••'
              className='w-full bg-[#141414] border border-[#2A2A2A] text-white px-4 py-3
                rounded-lg focus:outline-none focus:border-[#C9A84C] transition-colors' />
          </div>
          <button onClick={handleLogin} disabled={!email || !password || loading}
            className='w-full py-4 bg-[#C9A84C] disabled:opacity-30 text-black
              font-[Barlow_Condensed] font-bold text-xl rounded-lg hover:bg-[#E8C96A]
              transition-all hover:shadow-[0_0_20px_rgba(201,168,76,0.3)] mt-2'>
            {loading ? 'SIGNING IN...' : 'SIGN IN →'}
          </button>
          <p className='text-center text-[#666] text-sm'>
            Don't have an account?{' '}
            <Link href='/auth/signup' className='text-[#C9A84C] hover:underline'>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}