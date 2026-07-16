'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CONCERNS = [
  'Knee', 'Shoulder', 'Lower Back', 'Hip', 'Ankle / Foot',
  'Elbow', 'Neck', 'Wrist / Hand', 'Core & Spine', 'Full Body'
]

const TOTAL_STEPS = 5

export default function SignupPage() {
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState('fwd')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [heightVal, setHeightVal] = useState('')
  const [heightUnit, setHeightUnit] = useState('cm')
  const [weightVal, setWeightVal] = useState('')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [concern, setConcern] = useState('')

  function goNext() { setDirection('fwd'); setStep(s => s + 1) }
  function goBack() { setDirection('back'); setStep(s => Math.max(0, s - 1)) }

  async function handleCreateAccount() {
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message); setLoading(false); return
    }
    if (data.session) {
      setLoading(false)
      goNext()
    } else {
      setError('Check your email to confirm your account, then sign in.')
      setLoading(false)
    }
  }

  function toCm() {
    const v = parseFloat(heightVal)
    if (isNaN(v)) return null
    return heightUnit === 'cm' ? v : Math.round(v * 30.48)
  }
  function toKg() {
    const v = parseFloat(weightVal)
    if (isNaN(v)) return null
    return weightUnit === 'kg' ? v : Math.round(v * 0.453592)
  }

  async function finishIntake() {
    setLoading(true); setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth/login'); return }

    const { error } = await supabase.from('user_intake').upsert({
      user_id: session.user.id,
      first_name: firstName || null,
      last_name: lastName || null,
      date_of_birth: birthday || null,
      height_cm: toCm(),
      weight_kg: toKg(),
      primary_concern: concern || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

    setLoading(false)
    if (error) { setError(error.message); return }
    router.push(`/assessment?area=${encodeURIComponent(concern)}`)
  }

  return (
    <div className='min-h-screen bg-[#0A0A0A] flex flex-col'>

      {step > 0 && (
        <div className='px-6 pt-6'>
          <div className='max-w-md mx-auto'>
            <div className='h-1 bg-[#1A1A1A] rounded-full overflow-hidden'>
              <div className='h-full bg-[#C9A84C] rounded-full transition-all duration-500'
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className='flex-1 flex items-center justify-center px-4 py-8'>
        <div className='w-full max-w-md'>

          <div className='flex flex-col items-center mb-8'>
            {step > 0 ? (
              <button onClick={goBack}
                className='self-start text-[#555] hover:text-white text-sm mb-6 transition-colors'>
                ← Back
              </button>
            ) : (
              <Link href='/'
                className='self-start text-[#555] hover:text-white text-sm mb-6 transition-colors'>
                ← Back to home
              </Link>
            )}
            <img
              src='https://alkemesportsrx.com/wp-content/uploads/2026/06/Alkeme-Color-Logo.webp'
              alt='Alkeme' className='h-10 object-contain' />
          </div>

          {error && (
            <div className='bg-red-900/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm'>
              {error}
            </div>
          )}

          <div key={step}
            className={direction === 'fwd' ? 'animate-[slideIn_.35s_ease]' : 'animate-[slideBack_.35s_ease]'}>

            {step === 0 && (
              <div>
                <h1 className='font-[Barlow_Condensed] text-4xl font-bold text-white text-center mb-2'>
                  START YOUR RECOVERY
                </h1>
                <p className='text-[#666] text-center mb-8'>Create your account</p>
                <div className='flex flex-col gap-4'>
                  <div>
                    <label className='text-[#A0A0A0] text-sm mb-1.5 block'>Email</label>
                    <input type='email' value={email} onChange={e => setEmail(e.target.value)}
                      placeholder='your@email.com'
                      className='w-full bg-[#141414] border border-[#2A2A2A] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C9A84C] transition-colors' />
                  </div>
                  <div>
                    <label className='text-[#A0A0A0] text-sm mb-1.5 block'>Password</label>
                    <input type='password' value={password} onChange={e => setPassword(e.target.value)}
                      placeholder='At least 6 characters'
                      className='w-full bg-[#141414] border border-[#2A2A2A] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C9A84C] transition-colors' />
                  </div>
                  <button onClick={handleCreateAccount} disabled={!email || !password || loading}
                    className='w-full py-4 bg-[#C9A84C] disabled:opacity-30 text-black font-[Barlow_Condensed] font-bold text-xl rounded-lg hover:bg-[#E8C96A] transition-all mt-2'>
                    {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
                  </button>
                  <p className='text-center text-[#666] text-sm'>
                    Already have an account?{' '}
                    <Link href='/auth/login' className='text-[#C9A84C] hover:underline'>Sign in</Link>
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h1 className='font-[Barlow_Condensed] text-4xl font-bold text-white mb-2'>
                  WHAT&apos;S YOUR NAME?
                </h1>
                <p className='text-[#666] mb-8'>So we can personalize your plan.</p>
                <div className='flex flex-col gap-4'>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder='First name'
                    className='w-full bg-[#141414] border border-[#2A2A2A] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C9A84C] transition-colors' />
                  <input value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder='Last name'
                    className='w-full bg-[#141414] border border-[#2A2A2A] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C9A84C] transition-colors' />
                  <button onClick={goNext} disabled={!firstName}
                    className='w-full py-4 bg-[#C9A84C] disabled:opacity-30 text-black font-[Barlow_Condensed] font-bold text-xl rounded-lg hover:bg-[#E8C96A] transition-all mt-2'>
                    CONTINUE →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className='font-[Barlow_Condensed] text-4xl font-bold text-white mb-2'>
                  WHEN&apos;S YOUR BIRTHDAY?
                </h1>
                <p className='text-[#666] mb-8'>Age helps us pace your recovery safely.</p>
                <input type='date' value={birthday} onChange={e => setBirthday(e.target.value)}
                  className='w-full bg-[#141414] border border-[#2A2A2A] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C9A84C] transition-colors [color-scheme:dark]' />
                <button onClick={goNext} disabled={!birthday}
                  className='w-full py-4 bg-[#C9A84C] disabled:opacity-30 text-black font-[Barlow_Condensed] font-bold text-xl rounded-lg hover:bg-[#E8C96A] transition-all mt-6'>
                  CONTINUE →
                </button>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className='font-[Barlow_Condensed] text-4xl font-bold text-white mb-2'>
                  YOUR MEASUREMENTS
                </h1>
                <p className='text-[#666] mb-8'>Used to tailor exercise load and intensity.</p>

                <label className='text-[#A0A0A0] text-sm mb-1.5 block'>Height</label>
                <div className='flex gap-2 mb-5'>
                  <input type='number' value={heightVal} onChange={e => setHeightVal(e.target.value)}
                    placeholder={heightUnit === 'cm' ? '178' : '5.10'}
                    className='flex-1 bg-[#141414] border border-[#2A2A2A] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C9A84C] transition-colors' />
                  {['cm', 'ft'].map(u => (
                    <button key={u} onClick={() => setHeightUnit(u)}
                      className={`px-4 rounded-lg text-sm font-semibold transition-colors ${heightUnit === u ? 'bg-[#C9A84C] text-black' : 'bg-[#141414] border border-[#2A2A2A] text-[#888]'}`}>
                      {u}
                    </button>
                  ))}
                </div>

                <label className='text-[#A0A0A0] text-sm mb-1.5 block'>Weight</label>
                <div className='flex gap-2'>
                  <input type='number' value={weightVal} onChange={e => setWeightVal(e.target.value)}
                    placeholder={weightUnit === 'kg' ? '75' : '165'}
                    className='flex-1 bg-[#141414] border border-[#2A2A2A] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C9A84C] transition-colors' />
                  {['kg', 'lbs'].map(u => (
                    <button key={u} onClick={() => setWeightUnit(u)}
                      className={`px-4 rounded-lg text-sm font-semibold transition-colors ${weightUnit === u ? 'bg-[#C9A84C] text-black' : 'bg-[#141414] border border-[#2A2A2A] text-[#888]'}`}>
                      {u}
                    </button>
                  ))}
                </div>

                <button onClick={goNext} disabled={!heightVal || !weightVal}
                  className='w-full py-4 bg-[#C9A84C] disabled:opacity-30 text-black font-[Barlow_Condensed] font-bold text-xl rounded-lg hover:bg-[#E8C96A] transition-all mt-6'>
                  CONTINUE →
                </button>
              </div>
            )}

            {step === 4 && (
              <div>
                <h1 className='font-[Barlow_Condensed] text-4xl font-bold text-white mb-2'>
                  WHAT ARE WE WORKING ON?
                </h1>
                <p className='text-[#666] mb-6'>Select the area you want to recover.</p>
                <div className='grid grid-cols-2 gap-2 mb-6'>
                  {CONCERNS.map(c => (
                    <button key={c} onClick={() => setConcern(c)}
                      className={`px-4 py-3 rounded-lg text-sm text-left border transition-all ${concern === c ? 'bg-[#C9A84C]/10 border-[#C9A84C] text-[#C9A84C]' : 'bg-[#141414] border-[#2A2A2A] text-[#E8E8E8] hover:border-[#C9A84C]/50'}`}>
                      {c}
                    </button>
                  ))}
                </div>
                <button onClick={finishIntake} disabled={!concern || loading}
                  className='w-full py-4 bg-[#C9A84C] disabled:opacity-30 text-black font-[Barlow_Condensed] font-bold text-xl rounded-lg hover:bg-[#E8C96A] transition-all'>
                  {loading ? 'SAVING...' : 'BUILD MY PLAN →'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideBack {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}