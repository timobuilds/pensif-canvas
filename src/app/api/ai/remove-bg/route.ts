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
      process.env.REMOVE_BG_MODEL_ID || 'lucataco/remove-bg',
      {
        input: {
          image: image,
        },
      }
    )

    return NextResponse.json({ output })
  } catch (error) {
    console.error('RemoveBG API error:', error)
    return NextResponse.json(
      { error: 'Failed to remove background' },
      { status: 500 }
    )
  }
}
