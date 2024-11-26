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

    const { projectId, content, frameId, replyTo } = await req.json()
    if (!projectId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const comment = await commentStore.addComment(projectId, content, frameId, replyTo)
    
    // Broadcast the new comment to all project participants
    await realtimeManager.broadcast('comment-added', {
      projectId,
      comment,
    })

    return NextResponse.json(comment)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { commentId, content } = await req.json()
    if (!commentId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const comment = await commentStore.editComment(commentId, content)
    
    // Broadcast the comment update
    await realtimeManager.broadcast('comment-updated', {
      comment,
    })

    return NextResponse.json(comment)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { commentId } = await req.json()
    if (!commentId) {
      return NextResponse.json({ error: 'Missing commentId' }, { status: 400 })
    }

    await commentStore.deleteComment(commentId)
    
    // Broadcast the comment deletion
    await realtimeManager.broadcast('comment-deleted', {
      commentId,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
