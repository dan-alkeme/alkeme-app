import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const { area, painType, intensity, duration } = await request.json()

    const { data: exercises } = await supabase
      .from('exercises')
      .select('id, name, category, youtube_url')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are an expert physical therapist at Alkeme Sports Rx.
A patient has the following symptoms:
- Affected area: ${area}
- Pain type: ${painType}
- Intensity (1-10): ${intensity}
- Duration: ${duration}

From this list of available exercises:
${JSON.stringify(exercises)}

Select the 5 most appropriate exercises for this patient.
YOU MUST respond with ONLY a raw JSON array of exercise ids, no markdown, no backticks, no explanation.
Example: ["id1","id2","id3","id4","id5"]`
      }]
    })

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text.trim() : '[]'

    // Strip markdown code fences if Claude includes them
    const clean = responseText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    const selectedIds = JSON.parse(clean)
    const selected = exercises?.filter(e => selectedIds.includes(e.id)) || []

    return NextResponse.json({ exercises: selected })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}