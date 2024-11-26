import { NextResponse } from 'next/server'
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
})

export async function POST(request: Request) {
  try {
    const update = await request.json()
    
    await pusher.trigger(
      `canvas-${update.projectId}`,
      'canvas-update',
      update
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Realtime update error:', error)
    return NextResponse.json(
      { error: 'Failed to send update' },
      { status: 500 }
    )
  }
}
