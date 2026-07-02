'use client'
import { useState } from 'react'

const INJURY_AREAS = [
  'Rodilla / ACL', 'Espalda baja', 'Hombro', 'Cadera',
  'Tobillo / Pie', 'Codo', 'Cuello', 'Muñeca / Mano',
  'Core y columna', 'Balance y estabilidad', 'Plometría'
]

const PAIN_TYPES = [
  'Dolor constante', 'Dolor al moverme', 'Inflamación',
  'Rigidez / falta de movilidad', 'Debilidad muscular'
]

export default function SymptomForm() {
  const [area, setArea] = useState('')
  const [painType, setPainType] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState(false)
  const [exercises, setExercises] = useState([])

  async function handleSubmit() {
    setLoading(true)
    const res = await fetch('/api/symptoms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ area, painType, intensity, duration })
    })
    const data = await res.json()
    setExercises(data.exercises)
    setLoading(false)
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6'>
        ¿Qué te está molestando?
      </h1>

      {/* Área del cuerpo */}
      <div className='mb-6'>
        <label className='block font-semibold mb-2'>
          1. ¿Qué área te duele?
        </label>
        <div className='grid grid-cols-2 gap-2'>
          {INJURY_AREAS.map(a => (
            <button key={a}
              onClick={() => setArea(a)}
              className={`p-3 rounded border text-left ${ 
                area === a
                  ? 'border-yellow-500 bg-yellow-50 font-semibold'
                  : 'border-gray-200 hover:border-gray-400'
              }`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Tipo de dolor */}
      <div className='mb-6'>
        <label className='block font-semibold mb-2'>
          2. ¿Cómo describirías el dolor?
        </label>
        <div className='flex flex-col gap-2'>
          {PAIN_TYPES.map(pt => (
            <button key={pt}
              onClick={() => setPainType(pt)}
              className={`p-3 rounded border text-left ${
                painType === pt
                  ? 'border-yellow-500 bg-yellow-50 font-semibold'
                  : 'border-gray-200 hover:border-gray-400'
              }`}>
              {pt}
            </button>
          ))}
        </div>
      </div>

      {/* Intensidad */}
      <div className='mb-6'>
        <label className='block font-semibold mb-2'>
          3. Intensidad del dolor: {intensity}/10
        </label>
        <input type='range' min='1' max='10'
          value={intensity}
          onChange={e => setIntensity(Number(e.target.value))}
          className='w-full accent-yellow-500'
        />
        <div className='flex justify-between text-sm text-gray-400 mt-1'>
          <span>1 — Leve</span><span>10 — Severo</span>
        </div>
      </div>

      {/* Duración */}
      <div className='mb-8'>
        <label className='block font-semibold mb-2'>
          4. ¿Hace cuánto tienes este dolor?
        </label>
        <select
          value={duration}
          onChange={e => setDuration(e.target.value)}
          className='w-full p-3 rounded border border-gray-200'>
          <option value=''>Selecciona una opción</option>
          <option>Menos de 1 semana</option>
          <option>1–4 semanas</option>
          <option>1–3 meses</option>
          <option>Más de 3 meses</option>
        </select>
      </div>

      {/* Botón */}
      <button
        onClick={handleSubmit}
        disabled={!area || !painType || !duration || loading}
        className='w-full py-4 bg-yellow-500 text-black font-bold
          rounded-lg disabled:opacity-40 hover:bg-yellow-400 transition'>
        {loading ? 'Analizando tus síntomas...' : 'Ver mis ejercicios recomendados'}
      </button>

      {/* Resultados */}
      {exercises.length > 0 && (
        <div className='mt-8'>
          <h2 className='text-2xl font-bold mb-4'>
            Tu plan de ejercicios personalizado
          </h2>
          <div className='flex flex-col gap-4'>
            {exercises.map((ex: any) => (
              <div key={ex.id}
                className='p-4 border rounded-lg flex items-center gap-4'>
                <a href={ex.youtube_url} target='_blank'
                  className='bg-green-500 text-white px-4 py-2
                    rounded font-semibold hover:bg-green-400'>
                  ▶ Ver video
                </a>
                <div>
                  <p className='font-semibold'>{ex.name}</p>
                  <p className='text-sm text-gray-400'>{ex.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
