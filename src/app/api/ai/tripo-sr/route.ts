import { NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    const output = await replicate.run(
      process.env.TRIPO_SR_MODEL_ID || 'camenduru/tripo-sr',
      {
        input: {
          image: image,
          num_inference_steps: 50,
          guidance_scale: 7.5,
        },
      }
    )

    return NextResponse.json({ output })
  } catch (error) {
    console.error('TripoSR API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate 3D model' },
      { status: 500 }
    )
  }
}
