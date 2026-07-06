'use client'
import { useState } from 'react'
import HeroScreen from './components/HeroScreen'
import SymptomForm from './components/SymptomForm'

export default function Home() {
  const [started, setStarted] = useState(false)

  return (
    <main>
      {started ? (
        <SymptomForm onBack={() => setStarted(false)} />
      ) : (
        <HeroScreen onStart={() => setStarted(true)} />
      )}
    </main>
  )
}
