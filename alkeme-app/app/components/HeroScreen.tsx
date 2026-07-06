'use client'
import { useState, useEffect } from 'react'

const STATS = [
  { value: '98%',   label: 'Return-to-Play Rate' },
  { value: '3.4x',  label: 'Faster Recovery' },
  { value: '<9 mo', label: 'ACL Return' },
  { value: '25%',   label: 'Quad Strength Gain' },
]

const ATHLETES = [
  {
    name: 'Stefon Diggs',
    team: 'WR · Houston Texans',
    quote: '"Dr. Tabbah got me back on the field faster than I ever thought possible."'
  },
  {
    name: 'Antonio Gibson',
    team: 'RB · New England Patriots',
    quote: '"The rehab program here was unlike anything I had experienced before."'
  },
  {
    name: 'Malik Nabers',
    team: 'WR · New York Giants',
    quote: '"Alkeme\'s approach to recovery completely changed the game for me."'
  },
  {
    name: 'Kenny McIntosh',
    team: 'RB · Jacksonville Jaguars',
    quote: '"I came back stronger than I was before the injury. That says it all."'
  },
]

interface HeroScreenProps {
  onStart: () => void
}

export default function HeroScreen({ onStart }: HeroScreenProps) {
  const [visible, setVisible] = useState(false)
  const [activeAthlete, setActiveAthlete] = useState(0)

  useEffect(() => {
    setVisible(true)
    const interval = setInterval(() => {
      setActiveAthlete(prev => (prev + 1) % ATHLETES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`min-h-screen bg-[#0A0A0A] flex flex-col items-center
      justify-center px-4 py-12 transition-opacity duration-1000
      ${visible ? 'opacity-100' : 'opacity-0'}`}>

      {/* Logo */}
<div className='mb-8 flex flex-col items-center'>
  <img
    src='https://alkemesportsrx.com/wp-content/uploads/2026/06/Alkeme-Color-Logo.webp'
    alt='Alkeme Sports Rx'
    className='w-56 object-contain'
  />
</div>

      {/* Headline */}
      <h1 className='text-5xl md:text-7xl font-extrabold text-white text-center
        leading-none mb-4 font-[Barlow_Condensed]'>
        REHAB SMARTER.<br/>
        <span className='text-[#C9A84C]'>HEAL FASTER.</span>
      </h1>

      <p className='text-[#A0A0A0] text-center max-w-md mb-10 text-lg'>
        AI-powered rehabilitation programs built by the team
        behind the NFL's fastest recoveries.
      </p>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 w-full max-w-2xl'>
        {STATS.map((stat) => (
          <div key={stat.label}
            className='bg-[#141414] border border-[#C9A84C]/20 rounded-lg p-4 text-center'>
            <p className='text-3xl font-bold text-[#C9A84C] font-[Barlow_Condensed]'>
              {stat.value}
            </p>
            <p className='text-[#A0A0A0] text-xs mt-1'>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Athletes carousel */}
      <div className='w-full max-w-2xl mb-10 h-28 relative overflow-hidden'>
        {ATHLETES.map((athlete, i) => (
          <div key={athlete.name}
            className={`absolute inset-0 transition-all duration-700
              flex flex-col items-center text-center px-4
              ${i === activeAthlete
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'}`}>
            <p className='text-[#A0A0A0] italic text-base mb-3'>
              {athlete.quote}
            </p>
            <p className='text-[#C9A84C] font-semibold text-sm tracking-wider
              font-[Barlow_Condensed]'>
              {athlete.name}
              <span className='text-[#555] font-normal'> · {athlete.team}</span>
            </p>
          </div>
        ))}
        {/* Dot indicators */}
        <div className='absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2'>
          {ATHLETES.map((_, i) => (
            <button key={i} onClick={() => setActiveAthlete(i)}
              className={`h-1.5 rounded-full transition-all duration-300
                ${i === activeAthlete
                  ? 'bg-[#C9A84C] w-5'
                  : 'bg-[#444] w-1.5'}`} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <button onClick={onStart}
        className='bg-[#C9A84C] hover:bg-[#E8C96A] text-black font-bold text-xl
          px-12 py-4 rounded-lg tracking-wider transition-all duration-300
          hover:scale-105 hover:shadow-[0_0_30px_rgba(201,168,76,0.4)]
          font-[Barlow_Condensed]'>
        START MY ASSESSMENT →
      </button>

      <p className='text-[#333] text-xs mt-6'>
        Powered by Alkeme Sports Rx · Miami & Davie, FL
      </p>
    </div>
  )
}
