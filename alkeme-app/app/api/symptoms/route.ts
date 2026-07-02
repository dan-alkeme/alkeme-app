import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  const { area, painType, intensity, duration } = await request.json()

  // 1. Traer todos los ejercicios de Supabase
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, name, category, youtube_url')

  // 2. Pedirle a Claude que escoja los ejercicios correctos
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Eres un fisioterapeuta experto de Alkeme Sports Rx.
      Un paciente tiene los siguientes síntomas:
      - Área afectada: ${area}
      - Tipo de dolor: ${painType}
      - Intensidad (1-10): ${intensity}
      - Duración: ${duration}

      De esta lista de ejercicios disponibles:
      ${JSON.stringify(exercises)}
      Selecciona los 5 ejercicios más apropiados para este paciente.
      Responde SOLO con un array JSON con los ids de los ejercicios elegidos.
      Ejemplo: ["id1", "id2", "id3", "id4", "id5"]`
    }]
  })

  // 3. Parsear la respuesta y devolver los ejercicios con sus videos
  const responseText = message.content[0].type === 'text'
    ? message.content[0].text : '[]'
  const selectedIds = JSON.parse(responseText)
  const selected = exercises?.filter(e => selectedIds.includes(e.id)) || []

  return NextResponse.json({ exercises: selected })
}
