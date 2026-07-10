import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CHAT_TO_DB: Record<string, string> = {
  'Knee': 'Knee',
  'Shoulder': 'Shoulder',
  'Lower Back': 'Lower Back',
  'Hip': 'Hip',
  'Ankle / Foot': 'Ankle / Foot',
  'Elbow': 'Elbow',
  'Neck': 'Neck',
  'Wrist / Hand': 'Wrist / Hand',
  'Core & Spine': 'Core & Spine',
  'Full Body': 'Core & Spine'
}

// Orden progresivo de fases (nombres exactos de tu base)
const PHASE_ORDER: Record<string, number> = {
  'Joint Mobility': 1,
  'Flexibility': 2,
  'Rehab Strength - Phase 1': 3,
  'Rehab Strength - Phase 2': 4,
  'Rehab Strength - Phase 3': 5,
  'Rehab Strength - Phase 4': 6,
  'Balance & Proprioception': 7,
  'Trunk & Spine Stability': 8
}

export async function POST(request: Request) {
  try {
    const { area, goal, duration, aiAnswer } = await request.json()

    const category = CHAT_TO_DB[area] || 'Core & Spine'

    // Traer los ejercicios reales de la categoría
    const { data: exercises } = await supabase
      .from('exercises')
      .select('id, name, phase, target_muscle, youtube_url')
      .eq('category', category)

    const list = exercises || []

    // Ordenar por fase para una lista estable e indexada
    const sorted = [...list].sort(
      (a, b) => (PHASE_ORDER[a.phase] || 99) - (PHASE_ORDER[b.phase] || 99)
    )

    // Lista numerada para la IA (usamos números, no UUIDs, para evitar errores)
    const numbered = sorted
      .map((e, i) => `${i + 1}. [${e.phase || 'General'}] ${e.name}${e.target_muscle ? ` — ${e.target_muscle}` : ''}`)
      .join('\n')

    let summary = `Your program will focus on rebuilding strength and mobility in your ${area}.`
    let selectedIndices: number[] = []

    // Pedir a la IA: resumen + selección curada de 8-12 ejercicios
    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `You are a physical therapist at Alkeme Sports Rx building a personalized recovery plan.

PATIENT:
- Focus area: ${area}
- Goal: ${goal}
- Time dealing with this: ${duration}
- Additional note: ${aiAnswer}

AVAILABLE EXERCISES (choose ONLY from these, by number):
${numbered}

TASK:
Select the best 8 to 12 exercises for THIS patient and build a progressive plan: start with mobility/flexibility, move toward strength, and finish with balance/stability where appropriate. Pick only what fits their area, goal and situation.

Respond with ONLY a JSON object, no other text, exactly in this format:
{"summary": "one short motivating sentence, max 25 words, spoken directly to the patient (your program will...)", "exercises": [the chosen exercise NUMBERS]}`
        }]
      })

      const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
      const jsonStr = raw.replace(/```json/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(jsonStr)

      if (typeof parsed.summary === 'string' && parsed.summary.trim()) {
        summary = parsed.summary.trim()
      }
      if (Array.isArray(parsed.exercises)) {
        selectedIndices = parsed.exercises
          .map((n: any) => parseInt(n, 10))
          .filter((n: number) => Number.isInteger(n) && n >= 1 && n <= sorted.length)
      }
    } catch (e) {
      console.error('AI plan parse failed, using fallback:', e)
    }

    // Traducir números → ejercicios reales (sin duplicados, tope 12)
    const seen = new Set<number>()
    const chosen = selectedIndices
      .filter(n => { if (seen.has(n)) return false; seen.add(n); return true })
      .map(n => sorted[n - 1])
      .slice(0, 12)

    // Red de seguridad: si vinieron menos de 8, completar desde la lista ordenada
    if (chosen.length < 8) {
      for (const ex of sorted) {
        if (chosen.length >= 10) break
        if (!chosen.find(c => c.id === ex.id)) chosen.push(ex)
      }
    }

    // Ordenar el plan final por fase (para que se agrupe bien en el dashboard)
    chosen.sort((a, b) => (PHASE_ORDER[a.phase] || 99) - (PHASE_ORDER[b.phase] || 99))

    const exerciseIds = chosen.map(e => e.id)
    const phases = Array.from(new Set(chosen.map(e => e.phase).filter(Boolean)))

    return NextResponse.json({
      area,
      category,
      totalExercises: exerciseIds.length,
      phaseCount: phases.length,
      summary,
      exerciseIds
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}