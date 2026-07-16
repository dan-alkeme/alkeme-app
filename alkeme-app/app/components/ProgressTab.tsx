'use client'
import { Flame, Activity, Calendar, TrendingDown } from 'lucide-react'

// Datos de ejemplo para la demo (aún no se registran datos reales)
const OVERALL = 68 // % de recuperación general (marcador "You are here")

const WEEK = [
  { day: 'M', active: true },
  { day: 'T', active: true },
  { day: 'W', active: false },
  { day: 'T', active: true },
  { day: 'F', active: true },
  { day: 'S', active: false },
  { day: 'S', active: false },
]

const PHASE_PROGRESS = [
  { phase: 'Joint Mobility', pct: 100 },
  { phase: 'Flexibility', pct: 85 },
  { phase: 'Rehab Strength - Phase 1', pct: 60 },
  { phase: 'Rehab Strength - Phase 2', pct: 25 },
]

const PAIN = [
  { week: 'W1', level: 8 },
  { week: 'W2', level: 7 },
  { week: 'W3', level: 6 },
  { week: 'W4', level: 4 },
  { week: 'W5', level: 3 },
  { week: 'W6', level: 2 },
]

export default function ProgressTab() {
  const activeDays = WEEK.filter(d => d.active).length

  return (
    <div className='space-y-4'>

      {/* Header */}
      <div>
        <div className='flex items-center gap-2 mb-3'>
          <p className='text-[#C9A84C] text-xs tracking-[0.3em] font-semibold uppercase'>
            Progress Tracking
          </p>
          <span className='text-[9px] uppercase tracking-widest text-[#666] border border-[#2A2A2A] rounded-full px-2 py-0.5'>
            Sample
          </span>
        </div>
        <h1 className='font-[Barlow_Condensed] text-4xl font-bold text-white'>
          YOUR PROGRESS
        </h1>
      </div>

      {/* Barra grande: recuperación general con "You are here" */}
      <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-5'>
        <div className='flex items-baseline justify-between mb-5'>
          <span className='text-[#888] text-xs uppercase tracking-[0.2em]'>Overall Recovery</span>
          <span className='font-[Barlow_Condensed] font-bold text-[#C9A84C] leading-none text-4xl'>
            {OVERALL}<span className='text-2xl'>%</span>
          </span>
        </div>

        {/* Área de la barra */}
        <div className='relative' style={{ paddingTop: '34px', paddingBottom: '8px' }}>
          {/* Etiqueta "You are here" */}
          <div className='absolute top-0 flex flex-col items-center z-10'
            style={{ left: `${OVERALL}%`, transform: 'translateX(-50%)' }}>
            <span className='bg-[#C9A84C] text-black text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap leading-none'>
              You are here
            </span>
            <span className='w-2 h-2 bg-[#C9A84C] rotate-45 -mt-1' />
          </div>

          {/* Riel */}
          <div className='h-3 rounded-full bg-[#1A1A1A]'>
            <div className='h-3 rounded-full'
              style={{ width: `${OVERALL}%`, background: 'linear-gradient(90deg, #C9A84C, #E8C96A)' }} />
          </div>

          {/* Marcador sobre la barra */}
          <div className='absolute w-5 h-5 rounded-full bg-white border-[3px] border-[#C9A84C] z-10'
            style={{ left: `${OVERALL}%`, top: '34px', transform: 'translate(-50%, -4px)' }} />

          {/* Línea de tiempo porcentual: marcas | con número encima */}
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
          <p className='font-[Barlow_Condensed] text-3xl font-bold text-white leading-none'>12</p>
          <p className='text-[#666] text-[10px] uppercase tracking-wider mt-1.5'>Day streak</p>
        </div>
        <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-4 text-center'>
          <Activity size={18} className='text-[#C9A84C] mx-auto mb-2' />
          <p className='font-[Barlow_Condensed] text-3xl font-bold text-white leading-none'>34</p>
          <p className='text-[#666] text-[10px] uppercase tracking-wider mt-1.5'>Sessions</p>
        </div>
        <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-4 text-center'>
          <Calendar size={18} className='text-[#C9A84C] mx-auto mb-2' />
          <p className='font-[Barlow_Condensed] text-3xl font-bold text-white leading-none'>6</p>
          <p className='text-[#666] text-[10px] uppercase tracking-wider mt-1.5'>Weeks in</p>
        </div>
      </div>

      {/* Actividad de la semana */}
      <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-5'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-[Barlow_Condensed] text-lg font-bold text-white'>This Week</h3>
          <span className='text-[#888] text-xs'>{activeDays} of 7 days</span>
        </div>
        <div className='flex justify-between'>
          {WEEK.map((d, i) => (
            <div key={i} className='flex flex-col items-center gap-2'>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${d.active ? 'bg-[#C9A84C] text-black' : 'bg-[#1A1A1A] text-[#555] border border-[#2A2A2A]'}`}>
                {d.active ? '✓' : ''}
              </div>
              <span className='text-[#666] text-[10px]'>{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Avance por fase */}
      <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-5'>
        <h3 className='font-[Barlow_Condensed] text-lg font-bold text-white mb-4'>
          Progress by Phase
        </h3>
        <div className='space-y-4'>
          {PHASE_PROGRESS.map(p => (
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
      </div>

      {/* Tendencia de molestia */}
      <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-5'>
        <div className='flex items-center justify-between mb-5'>
          <h3 className='font-[Barlow_Condensed] text-lg font-bold text-white'>
            Discomfort Level
          </h3>
          <div className='flex items-center gap-1.5 text-[#5FBF7F]'>
            <TrendingDown size={16} />
            <span className='text-xs font-semibold'>Trending down</span>
          </div>
        </div>
        <div className='flex items-end justify-between gap-2 h-32'>
          {PAIN.map(p => (
            <div key={p.week} className='flex-1 flex flex-col items-center h-full'>
              <div className='flex-1 w-full flex items-end'>
                <div className='w-full bg-[#1A1A1A] rounded-md flex items-end h-full'>
                  <div className='w-full rounded-md'
                    style={{ height: `${p.level * 10}%`, background: 'linear-gradient(180deg, #E8C96A, #C9A84C)' }} />
                </div>
              </div>
              <span className='text-[#666] text-[10px] mt-2'>{p.week}</span>
            </div>
          ))}
        </div>
        <p className='text-[#666] text-xs mt-4 text-center'>
          Reported discomfort dropped from 8 to 2 over 6 weeks.
        </p>
      </div>
    </div>
  )
}