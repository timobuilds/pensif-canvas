import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { commentStore } from '@/app/lib/storage/commentStore'
import { realtimeManager } from '@/app/lib/realtime/realtimeManager'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { commentId, emoji } = await req.json()
    if (!commentId || !emoji) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const comment = await commentStore.addReaction(commentId, emoji)
    
    // Broadcast the reaction update
    await realtimeManager.broadcast('reaction-updated', {
      commentId,
      reactions: comment.reactions,
    })

    return NextResponse.json(comment)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
