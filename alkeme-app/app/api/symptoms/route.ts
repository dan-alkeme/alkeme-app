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

export async function POST(request: Request) {
  try {
    const { area, goal, duration, aiAnswer } = await request.json()

    const category = CHAT_TO_DB[area] || 'Core & Spine'

    // Count exercises + phases available for this category
    const { data: exercises } = await supabase
      .from('exercises')
      .select('phase')
      .eq('category', category)

    const totalExercises = exercises?.length || 0
    const phases = Array.from(
      new Set((exercises || []).map(e => e.phase).filter(Boolean))
    )

    // Ask Claude for a short personalized plan summary
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `You are a physical therapist at Alkeme Sports Rx.
A patient wants to work on their ${area}. Their goal is "${goal}", they have been dealing with this for "${duration}", and they added: "${aiAnswer}".

Write ONE short, motivating sentence (max 25 words) summarizing what their recovery program will focus on. Speak directly to them ("your program will..."). No greeting, just the sentence.`
      }]
    })

    const summary = message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : `Your program will focus on rebuilding strength and mobility in your ${area}.`

    return NextResponse.json({
      area,
      category,
      totalExercises,
      phaseCount: phases.length,
      summary
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}