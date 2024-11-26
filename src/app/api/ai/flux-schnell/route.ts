import { NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { sketch, prompt } = await request.json()

    if (!sketch) {
      return NextResponse.json(
        { error: 'Sketch data is required' },
        { status: 400 }
      )
    }

    const output = await replicate.run(
      process.env.FLUX_SCHNELL_MODEL_ID || 'black-forest-labs/flux-schnell',
      {
        input: {
          sketch_base64: sketch,
          prompt: prompt || '',
        },
      }
    )

    return NextResponse.json({ output })
  } catch (error) {
    console.error('Flux Schnell API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
