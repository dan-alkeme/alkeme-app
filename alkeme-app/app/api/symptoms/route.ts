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

type ProgramWeek = {
  week: number
  focus: string
  days: { day: number; exerciseIds: string[] }[]
}

export async function POST(request: Request) {
  try {
    const { area, goal, duration, aiAnswer } = await request.json()

    const category = CHAT_TO_DB[area] || 'Core & Spine'

    const { data: exercises } = await supabase
      .from('exercises')
      .select('id, name, phase, target_muscle, youtube_url')
      .eq('category', category)

    const list = exercises || []

    const sorted = [...list].sort(
      (a, b) => (PHASE_ORDER[a.phase] || 99) - (PHASE_ORDER[b.phase] || 99)
    )

    const numbered = sorted
      .map((e, i) => `${i + 1}. [${e.phase || 'General'}] ${e.name}${e.target_muscle ? ` — ${e.target_muscle}` : ''}`)
      .join('\n')

    let summary = `Your program will focus on rebuilding strength and mobility in your ${area}.`
    let program: ProgramWeek[] = []

    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: `You are a physical therapist at Alkeme Sports Rx building a personalized 6-week recovery PROGRAM.

PATIENT:
- Focus area: ${area}
- Goal: ${goal}
- Time dealing with this: ${duration}
- Additional note: ${aiAnswer}

AVAILABLE EXERCISES (choose ONLY from these, by number):
${numbered}

TASK:
Design a progressive 6-week rehab program for THIS patient.
- Exactly 6 weeks.
- Each week has 3 or 4 training days.
- Each day has 4 to 6 exercises.
- Progress logically: early weeks emphasize mobility, flexibility and activation; middle weeks build strength (Phase 1 -> 2 -> 3); later weeks add balance/stability and higher-level strength.
- Build the whole program around a focused core set of about 12 to 16 distinct exercises total. Reuse these same exercises across the weeks, progressing them (more reps/harder variations), rather than introducing many new ones. It is good for the patient to repeat and master a consistent set. Do NOT exceed 18 distinct exercises in the entire program.- Give each week a short "focus" label (max 4 words).
- Use ONLY the exercise NUMBERS from the list above.

Respond with ONLY a JSON object, no other text, exactly in this format:
{
  "summary": "one short motivating sentence, max 25 words, spoken to the patient (your program will...)",
  "weeks": [
    { "week": 1, "focus": "Mobility & activation", "days": [ { "day": 1, "exercises": [3, 7, 12] }, { "day": 2, "exercises": [5, 9, 14] } ] }
  ]
}
Include all 6 weeks.`
        }]
      })

      const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
      const jsonStr = raw.replace(/```json/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(jsonStr)

      if (typeof parsed.summary === 'string' && parsed.summary.trim()) {
        summary = parsed.summary.trim()
      }

      if (Array.isArray(parsed.weeks)) {
        program = parsed.weeks.map((w: any) => ({
          week: Number(w.week),
          focus: typeof w.focus === 'string' ? w.focus : '',
          days: (Array.isArray(w.days) ? w.days : []).map((d: any) => ({
            day: Number(d.day),
            exerciseIds: (Array.isArray(d.exercises) ? d.exercises : [])
              .map((n: any) => parseInt(n, 10))
              .filter((n: number) => Number.isInteger(n) && n >= 1 && n <= sorted.length)
              .map((n: number) => sorted[n - 1].id)
          }))
        }))
        program = program.filter(w => w.week && w.days.length > 0)
      }
    } catch (e) {
      console.error('AI program generation failed, using fallback:', e)
    }

    if (program.length === 0 && sorted.length > 0) {
      const pool = sorted.slice(0, 30)
      let idx = 0
      for (let w = 1; w <= 6; w++) {
        const days = []
        for (let d = 1; d <= 3; d++) {
          const dayEx: string[] = []
          for (let k = 0; k < 5; k++) {
            dayEx.push(pool[idx % pool.length].id)
            idx++
          }
          days.push({ day: d, exerciseIds: dayEx })
        }
        program.push({ week: w, focus: '', days })
      }
    }

    const allIds = new Set<string>()
    for (const w of program) for (const d of w.days) for (const id of d.exerciseIds) allIds.add(id)
    const exerciseIds = Array.from(allIds)

    const usedPhases = new Set<string>()
    for (const id of exerciseIds) {
      const ex = sorted.find(e => e.id === id)
      if (ex?.phase) usedPhases.add(ex.phase)
    }

    return NextResponse.json({
      area,
      category,
      totalExercises: exerciseIds.length,
      phaseCount: usedPhases.size,
      weekCount: program.length,
      summary,
      exerciseIds,
      program
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}