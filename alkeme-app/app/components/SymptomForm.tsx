'use client'
import { useState } from 'react'

const INJURY_AREAS = [
  { label: 'Knee / ACL', icon: '🦵' },
  { label: 'Lower Back', icon: '🔙' },
  { label: 'Shoulder', icon: '💪' },
  { label: 'Hip', icon: '🏃' },
  { label: 'Ankle / Foot', icon: '🦶' },
  { label: 'Elbow', icon: '🤸' },
  { label: 'Neck', icon: '🫀' },
  { label: 'Wrist / Hand', icon: '✋' },
  { label: 'Core & Spine', icon: '⚡' },
  { label: 'Balance & Stability', icon: '⚖️' },
  { label: 'Plyometrics', icon: '🚀' },
]

const PAIN_TYPES = [
  { label: 'Constant Pain', icon: '🔥' },
  { label: 'Pain When Moving', icon: '⚡' },
  { label: 'Inflammation / Swelling', icon: '💧' },
  { label: 'Stiffness / Limited Mobility', icon: '🔒' },
  { label: 'Muscle Weakness', icon: '📉' },
]

const DURATIONS = [
  { label: 'Less than 1 week', icon: '📅' },
  { label: '1–4 weeks', icon: '📆' },
  { label: '1–3 months', icon: '🗓️' },
  { label: 'More than 3 months', icon: '⏰' },
]

const STEPS = ['Injury Area', 'Pain Type', 'Intensity', 'Duration']

function getYouTubeId(url: string) {
  if (!url) return null
  const match = url.match(/(?:shorts\/|watch\?v=|youtu\.be\/)([^?&\s]+)/)
  return match ? match[1] : null
}

export default function SymptomForm({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0)
  const [area, setArea] = useState('')
  const [painType, setPainType] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState(false)
  const [exercises, setExercises] = useState<any[]>([])
  const [animating, setAnimating] = useState(false)
  const [error, setError] = useState('')

  function nextStep() {
    setAnimating(true)
    setTimeout(() => { setStep(prev => prev + 1); setAnimating(false) }, 300)
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area, painType, intensity, duration })
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setExercises(data.exercises)
      setStep(5)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  function reset() {
    setStep(0); setArea(''); setPainType('')
    setIntensity(5); setDuration(''); setExercises([])
    setError('')
  }

  const sliderBg = `linear-gradient(to right, #C9A84C ${(intensity - 1) / 9 * 100}%, #222 ${(intensity - 1) / 9 * 100}%)`

  const chipClass = (selected: boolean) =>
  `w-full py-5 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center ${selected ? 'border-[#C9A84C] bg-[#C9A84C] text-black shadow-[0_0_15px_rgba(201,168,76,0.3)]' : 'border-[#333] bg-[#1A1A1A] text-white hover:border-[#C9A84C]/50 hover:bg-[#222]'}`
  return (
    <div className='min-h-screen bg-[#0A0A0A] px-4 py-10 flex flex-col items-center'>

      {/* Header */}
      <div className='w-full max-w-2xl mb-8'>
        <button onClick={onBack}
          className='text-[#A0A0A0] hover:text-[#C9A84C] text-sm mb-6 transition-colors'>
          ← Back
        </button>
        {step < 5 && (
          <>
            <div className='flex gap-2 mb-3'>
              {STEPS.map((s, i) => (
                <div key={s} className='flex-1'>
                  <div className={`h-1 rounded-full transition-all duration-500
                    ${i <= step ? 'bg-[#C9A84C]' : 'bg-[#222]'}`} />
                </div>
              ))}
            </div>
            <p className='text-[#E8E8E8] text-sm'>Step {step + 1} of 4 · {STEPS[step]}</p>
          </>
        )}
      </div>

      {/* Content */}
      <div className={`w-full max-w-2xl transition-all duration-300
        ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

        {/* Step 1 — Injury Area */}
        {step === 0 && (
          <div>
            <h2 className='font-[Barlow_Condensed] text-4xl font-bold text-white mb-2'>
              WHERE IS YOUR PAIN?
            </h2>
            <p className='text-[#E8E8E8] mb-6'>Select the area that is bothering you most.</p>
            <div className='grid grid-cols-2 gap-3 mb-4'>
              {INJURY_AREAS.map(({ label, icon }) => (
                <button key={label} onClick={() => setArea(label)} className={chipClass(area === label)}>
                  <span className='text-2xl'>{icon}</span>
                  <span className='text-[#E8E8E8]'>{label}</span>
                </button>
              ))}
            </div>
            {area && (
              <div className='mb-5 px-4 py-2 bg-[#C9A84C]/10 border border-[#C9A84C]/20
                rounded-lg inline-flex items-center gap-2'>
                <span className='text-[#C9A84C] text-sm'>Selected:</span>
                <span className='text-white text-sm font-semibold'>{area}</span>
              </div>
            )}
            <button onClick={nextStep} disabled={!area}
              className='mt-2 w-full py-4 bg-[#C9A84C] disabled:opacity-30 text-black
                font-[Barlow_Condensed] font-bold text-xl rounded-lg hover:bg-[#E8C96A]
                transition-all hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]'>
              NEXT →
            </button>
          </div>
        )}

        {/* Step 2 — Pain Type */}
        {step === 1 && (
          <div>
            <h2 className='font-[Barlow_Condensed] text-4xl font-bold text-white mb-2'>
              HOW DOES IT FEEL?
            </h2>
            <p className='text-[#A0A0A0] mb-6'>Describe the type of pain or discomfort.</p>
            <div className='grid grid-cols-2 gap-3 mb-4'>
              {PAIN_TYPES.map(({ label, icon }) => (
                <button key={label} onClick={() => setPainType(label)} className={chipClass(painType === label)}>
                  <span className='text-2xl'>{icon}</span>
                  <span className='text-[#E8E8E8]'>{label}</span>
                  {painType === label && <span>✓</span>}
                </button>
              ))}
            </div>
            {painType && (
              <div className='mb-5 px-4 py-2 bg-[#C9A84C]/10 border border-[#C9A84C]/20
                rounded-lg inline-flex items-center gap-2'>
                <span className='text-[#C9A84C] text-sm'>Selected:</span>
                <span className='text-white text-sm font-semibold'>{painType}</span>
              </div>
            )}
            <button onClick={nextStep} disabled={!painType}
              className='mt-2 w-full py-4 bg-[#C9A84C] disabled:opacity-30 text-black
                font-[Barlow_Condensed] font-bold text-xl rounded-lg hover:bg-[#E8C96A]
                transition-all hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]'>
              NEXT →
            </button>
          </div>
        )}

        {/* Step 3 — Intensity */}
        {step === 2 && (
          <div>
            <h2 className='font-[Barlow_Condensed] text-4xl font-bold text-white mb-2'>
              PAIN INTENSITY
            </h2>
            <p className='text-[#A0A0A0] mb-8'>On a scale of 1 to 10, how bad is it?</p>
            <div className='text-center mb-8'>
              <span className='font-[Barlow_Condensed] text-9xl font-bold text-[#C9A84C]'>
                {intensity}
              </span>
              <span className='text-[#555] text-3xl'>/10</span>
              <p className={`mt-3 text-lg font-semibold transition-colors ${
                intensity <= 3 ? 'text-green-400'
                : intensity <= 6 ? 'text-yellow-400'
                : 'text-red-400'
              }`}>
                {intensity <= 3 ? '🟢 Mild discomfort'
                : intensity <= 6 ? '🟡 Moderate pain'
                : '🔴 Severe pain'}
              </p>
            </div>
            <input type='range' min='1' max='10' value={intensity}
              onChange={e => setIntensity(Number(e.target.value))}
              className='w-full h-2 rounded-full mb-2 outline-none cursor-pointer accent-[#C9A84C]'
              style={{ background: sliderBg }}
            />
            <div className='flex justify-between text-[#555] text-sm mb-8'>
              <span>1 — Mild</span><span>10 — Severe</span>
            </div>
            <button onClick={nextStep}
              className='w-full py-4 bg-[#C9A84C] text-black font-[Barlow_Condensed]
                font-bold text-xl rounded-lg hover:bg-[#E8C96A] transition-all
                hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]'>
              NEXT →
            </button>
          </div>
        )}

        {/* Step 4 — Duration */}
        {step === 3 && (
          <div>
            <h2 className='font-[Barlow_Condensed] text-4xl font-bold text-white mb-2'>
              HOW LONG?
            </h2>
            <p className='text-[#A0A0A0] mb-6'>How long have you been experiencing this?</p>
            <div className='grid grid-cols-2 gap-3 mb-4'>
              {DURATIONS.map(({ label, icon }) => (
                <button key={label} onClick={() => setDuration(label)} className={chipClass(duration === label)}>
                  <span className='text-2xl'>{icon}</span>
                  <span className='text-[#E8E8E8]'>{label}</span>
                  {duration === label && <span>✓</span>}
                </button>
              ))}
            </div>
            {duration && (
              <div className='mb-5 px-4 py-2 bg-[#C9A84C]/10 border border-[#C9A84C]/20
                rounded-lg inline-flex items-center gap-2'>
                <span className='text-[#C9A84C] text-sm'>Selected:</span>
                <span className='text-white text-sm font-semibold'>{duration}</span>
              </div>
            )}
            <button onClick={handleSubmit} disabled={!duration || loading}
              className='mt-2 w-full py-4 bg-[#C9A84C] disabled:opacity-30 text-black
                font-[Barlow_Condensed] font-bold text-xl rounded-lg hover:bg-[#E8C96A]
                transition-all hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]'>
              {loading ? 'ANALYZING YOUR SYMPTOMS...' : 'GET MY PLAN →'}
            </button>
            {error && (
              <div className='mt-4 p-4 bg-red-900/20 border border-red-500/30
                rounded-lg text-red-400 text-sm text-center'>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {step === 5 && (
          <div>
            <h2 className='font-[Barlow_Condensed] text-4xl font-bold text-white mb-2'>
              YOUR DAY 1 PLAN
            </h2>
            <p className='text-[#A0A0A0] mb-6'>
              Based on your{' '}
              <span className='text-[#C9A84C]'>{area}</span>{' '}
              symptoms, here are your personalized exercises.
            </p>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              {exercises.map((ex: any, i: number) => {
                const videoId = getYouTubeId(ex.youtube_url)
                if (i === 2) return (
                  <div key='paywall'
                    className='col-span-2 md:col-span-3 bg-[#141414] border
                      border-[#C9A84C]/30 rounded-xl p-6 text-center'>
                    <p className='text-[#C9A84C] text-xs tracking-widest font-semibold mb-2'>
                      FULL PLAN LOCKED
                    </p>
                    <h3 className='font-[Barlow_Condensed] text-2xl font-bold text-white mb-1'>
                      {exercises.length - 2} more exercises in your plan
                    </h3>
                    <p className='text-[#666] text-sm mb-4'>
                      Subscribe to unlock your complete recovery program
                    </p>
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/stripe/checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
                          })
                        })
                        const { url } = await res.json()
                        if (url) window.location.href = url
                      }}
                      className='bg-[#C9A84C] text-black font-[Barlow_Condensed] font-bold
                        text-lg px-8 py-3 rounded-lg hover:bg-[#E8C96A] transition-all
                        hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]'>
                      UNLOCK FOR $29/MO
                    </button>
                  </div>
                )
                if (i > 2) return null
                return (
                  <div key={ex.id}
                    className='bg-[#141414] border border-[#1A1A1A] hover:border-[#C9A84C]/40
                      rounded-xl overflow-hidden transition-all group flex flex-col'>
                    {/* Thumbnail */}
                    <div className='relative aspect-video bg-[#0D0D0D] overflow-hidden'>
                      {videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt={ex.name}
                          className='w-full h-full object-cover group-hover:scale-105
                            transition-transform duration-300'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <span className='text-[#333] text-4xl'>▶</span>
                        </div>
                      )}
                      {/* Hover play overlay */}
                      <div className='absolute inset-0 bg-black/40 opacity-0
                        group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                        <div className='w-14 h-14 bg-[#C9A84C] rounded-full flex
                          items-center justify-center shadow-lg'>
                          <span className='text-black text-xl ml-1'>▶</span>
                        </div>
                      </div>
                      {/* Number badge */}
                      <div className='absolute top-2 left-2 w-7 h-7 bg-[#C9A84C]
                        rounded-full flex items-center justify-center shadow'>
                        <span className='text-black text-xs font-bold'>{i + 1}</span>
                      </div>
                    </div>
                    {/* Info */}
                    <div className='p-3 flex flex-col flex-1'>
                      <p className='font-semibold text-white text-sm leading-tight mb-1'>
                        {ex.name}
                      </p>
                      <p className='text-[#555] text-xs mb-3'>{ex.category}</p>
                      <a href={ex.youtube_url} target='_blank'
                        className='mt-auto w-full bg-[#C9A84C] hover:bg-[#E8C96A] text-black
                          font-bold text-sm py-2.5 rounded-lg transition-all text-center
                          hover:shadow-[0_0_15px_rgba(201,168,76,0.4)]
                          flex items-center justify-center gap-2'>
                        ▶ PLAY VIDEO
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
            <button onClick={reset}
              className='mt-8 w-full py-3 border border-[#C9A84C]/30 text-[#C9A84C]
                font-[Barlow_Condensed] font-bold rounded-lg hover:bg-[#C9A84C]/10
                transition-all'>
              START OVER
            </button>
          </div>
        )}
      </div>
    </div>
  )
}