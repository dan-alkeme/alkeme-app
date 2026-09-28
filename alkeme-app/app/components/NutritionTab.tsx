'use client'
import { Droplets, Leaf, Beef, Zap, Utensils, Info } from 'lucide-react'

const PILLARS = [
  { Icon: Beef, title: 'Protein to rebuild', desc: 'Supports muscle and tissue repair after each session. Include a source at every meal.' },
  { Icon: Leaf, title: 'Anti-inflammatory foods', desc: 'Colorful vegetables, berries and omega-3s help calm inflammation so tissue can heal.' },
  { Icon: Droplets, title: 'Hydration', desc: 'Water keeps joints lubricated and muscles working. Sip through the day, more on training days.' },
  { Icon: Zap, title: 'Smart energy', desc: 'Whole-food carbs fuel your sessions and recovery without the crash of processed sugar.' },
]

const PLATE = [
  { label: 'Vegetables & fruit', pct: 40, color: '#5FBF7F' },
  { label: 'Lean protein', pct: 30, color: '#C9A84C' },
  { label: 'Whole-food carbs', pct: 30, color: '#8AB4F8' },
]

const DAY = [
  { meal: 'Breakfast', idea: 'Greek yogurt with berries, oats and a drizzle of honey' },
  { meal: 'Lunch', idea: 'Grilled chicken, quinoa and a big mixed-greens salad' },
  { meal: 'Snack', idea: 'Apple with almond butter, or a handful of walnuts' },
  { meal: 'Dinner', idea: 'Baked salmon, roasted vegetables and sweet potato' },
]

const HELPS = ['Fatty fish (salmon, sardines)', 'Leafy greens & broccoli', 'Berries & cherries', 'Nuts, seeds & olive oil', 'Turmeric & ginger']
const LIMIT = ['Sugary drinks & sweets', 'Ultra-processed snacks', 'Excess fried food', 'Heavy alcohol']

export default function NutritionTab() {
  return (
    <div className='space-y-4'>

      {/* Header */}
      <div>
        <div className='flex items-center gap-2 mb-3'>
          <p className='text-[#C9A84C] text-xs tracking-[0.3em] font-semibold uppercase'>
            Nutrition Guidance
          </p>
          <span className='text-[9px] uppercase tracking-widest text-[#666] border border-[#2A2A2A] rounded-full px-2 py-0.5'>
            Sample
          </span>
        </div>
        <h1 className='font-[Barlow_Condensed] text-4xl font-bold text-white'>
          FUEL YOUR RECOVERY
        </h1>
        <p className='text-[#888] text-sm mt-2 max-w-md leading-relaxed'>
          What you eat is part of how you heal. These are general principles to support your recovery.
        </p>
      </div>

      {/* Pilares */}
      <div className='grid grid-cols-2 gap-3'>
        {PILLARS.map(p => (
          <div key={p.title} className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-4'>
            <p.Icon size={20} className='text-[#C9A84C] mb-2' />
            <h3 className='text-white font-semibold text-sm mb-1'>{p.title}</h3>
            <p className='text-[#888] text-xs leading-relaxed'>{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Plato de recuperación */}
      <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-5'>
        <div className='flex items-center gap-2 mb-4'>
          <Utensils size={16} className='text-[#C9A84C]' />
          <h3 className='font-[Barlow_Condensed] text-lg font-bold text-white'>Your Recovery Plate</h3>
        </div>
        <div className='flex h-4 rounded-full overflow-hidden mb-4'>
          {PLATE.map(s => (
            <div key={s.label} style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
          ))}
        </div>
        <div className='space-y-2'>
          {PLATE.map(s => (
            <div key={s.label} className='flex items-center justify-between text-xs'>
              <div className='flex items-center gap-2'>
                <span className='w-2.5 h-2.5 rounded-full' style={{ backgroundColor: s.color }} />
                <span className='text-[#CCC]'>{s.label}</span>
              </div>
              <span className='text-[#888]'>{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Día de ejemplo */}
      <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-5'>
        <h3 className='font-[Barlow_Condensed] text-lg font-bold text-white mb-4'>A Day of Eating</h3>
        <div className='space-y-3'>
          {DAY.map(d => (
            <div key={d.meal} className='flex gap-3'>
              <span className='shrink-0 w-20 text-[#C9A84C] text-xs font-semibold uppercase tracking-wider pt-0.5'>
                {d.meal}
              </span>
              <span className='text-[#CCC] text-sm leading-snug'>{d.idea}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ayudan / limitar */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-4'>
          <h3 className='text-[#5FBF7F] font-semibold text-sm mb-3'>Foods that help</h3>
          <ul className='space-y-1.5'>
            {HELPS.map(f => (
              <li key={f} className='text-[#CCC] text-xs flex gap-2'>
                <span className='text-[#5FBF7F]'>+</span>{f}
              </li>
            ))}
          </ul>
        </div>
        <div className='bg-[#111] border border-[#1A1A1A] rounded-2xl p-4'>
          <h3 className='text-[#C97C4C] font-semibold text-sm mb-3'>Best to limit</h3>
          <ul className='space-y-1.5'>
            {LIMIT.map(f => (
              <li key={f} className='text-[#CCC] text-xs flex gap-2'>
                <span className='text-[#C97C4C]'>−</span>{f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Nota de seguridad */}
      <div className='flex gap-2 items-start bg-[#0E0E0E] border border-[#1A1A1A] rounded-2xl p-4'>
        <Info size={14} className='text-[#666] shrink-0 mt-0.5' />
        <p className='text-[#666] text-xs leading-relaxed'>
          General guidance for education only — not a substitute for personalized advice from your care
          team or a registered dietitian.
        </p>
      </div>
    </div>
  )
}