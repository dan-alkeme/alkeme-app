import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  try {
    const { area, goal, duration } = await request.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `You are an expert physical therapist at Alkeme Sports Rx.

A patient wants to work on:
- Area: ${area}
- Goal: ${goal}
- Time working on it: ${duration}

Generate ONE short follow-up question to gather the most critical remaining information needed to recommend the best exercises. The question must be specific, clinically relevant, and help distinguish between different exercise protocols.

Respond ONLY with a valid JSON object in this exact format with no markdown, no backticks:
{"question": "Your question here?", "options": ["Option 1", "Option 2", "Option 3", "Option 4"]}`
      }]
    })

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text.trim() : ''

    const clean = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)

  } catch (error) {
    console.error('Question API error:', error)
    return NextResponse.json({
      question: 'What best describes your current activity level?',
      options: [
        'Mostly sedentary — limited daily movement',
        'Lightly active — walking and basic tasks',
        'Moderately active — some exercise weekly',
        'Very active — training regularly'
      ]
    })
  }
}