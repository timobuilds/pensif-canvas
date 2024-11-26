import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Comment, CommentThread } from '@/app/lib/types/comments'
import { CommentThread as CommentThreadComponent } from './CommentThread'
import { realtimeManager } from '@/app/lib/realtime/realtimeManager'

interface CommentPanelProps {
  projectId: string
  frameId?: string
  className?: string
}

export function CommentPanel({ projectId, frameId, className = '' }: CommentPanelProps) {
  const { user } = useUser()
  const [threads, setThreads] = useState<CommentThread[]>([])
  const [newCommentContent, setNewCommentContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadComments()
    subscribeToComments()
  }, [projectId, frameId])

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/comments?projectId=${projectId}${frameId ? `&frameId=${frameId}` : ''}`)
      const data = await response.json()
      setThreads(data.threads)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToComments = () => {
    realtimeManager.subscribe('comment-added', handleCommentAdded)
    realtimeManager.subscribe('comment-updated', handleCommentUpdated)
    realtimeManager.subscribe('comment-deleted', handleCommentDeleted)
    realtimeManager.subscribe('reaction-updated', handleReactionUpdated)

    return () => {
      realtimeManager.unsubscribe('comment-added', handleCommentAdded)
      realtimeManager.unsubscribe('comment-updated', handleCommentUpdated)
      realtimeManager.unsubscribe('comment-deleted', handleCommentDeleted)
      realtimeManager.unsubscribe('reaction-updated', handleReactionUpdated)
    }
  }

  const handleCommentAdded = (data: { projectId: string; comment: Comment }) => {
    if (data.projectId === projectId) {
      if (data.comment.replyTo) {
        setThreads((prevThreads) =>
          prevThreads.map((thread) => {
            if (thread.comments.some((c) => c.id === data.comment.replyTo)) {
              return {
                ...thread,
                comments: [...thread.comments, data.comment],
              }
            }
            return thread
          })
        )
      } else {
        setThreads((prevThreads) => [
          ...prevThreads,
          {
            id: crypto.randomUUID(),
            comments: [data.comment],
            resolved: false,
          },
        ])
      }
    }
  }

  const handleCommentUpdated = (data: { comment: Comment }) => {
    setThreads((prevThreads) =>
      prevThreads.map((thread) => ({
        ...thread,
        comments: thread.comments.map((c) =>
          c.id === data.comment.id ? data.comment : c
        ),
      }))
    )
  }

  const handleCommentDeleted = (data: { commentId: string }) => {
    setThreads((prevThreads) =>
      prevThreads
        .map((thread) => ({
          ...thread,
          comments: thread.comments.filter((c) => c.id !== data.commentId),
        }))
        .filter((thread) => thread.comments.length > 0)
    )
  }

  const handleReactionUpdated = (data: { commentId: string; reactions: { [key: string]: string[] } }) => {
    setThreads((prevThreads) =>
      prevThreads.map((thread) => ({
        ...thread,
        comments: thread.comments.map((c) =>
          c.id === data.commentId ? { ...c, reactions: data.reactions } : c
        ),
      }))
    )
  }

  const handleAddComment = async (content: string, replyTo?: string) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          frameId,
          content,
          replyTo,
        }),
      })

      if (!response.ok) throw new Error('Failed to add comment')
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          content,
        }),
      })

      if (!response.ok) throw new Error('Failed to edit comment')
    } catch (error) {
      console.error('Failed to edit comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      })

      if (!response.ok) throw new Error('Failed to delete comment')
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const handleReactToComment = async (commentId: string, emoji: string) => {
    try {
      const response = await fetch('/api/comments/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          emoji,
        }),
      })

      if (!response.ok) throw new Error('Failed to add reaction')
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  const handleResolveThread = async (threadId: string) => {
    try {
      const response = await fetch('/api/comments/threads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          resolved: true,
        }),
      })

      if (!response.ok) throw new Error('Failed to resolve thread')

      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === threadId ? { ...thread, resolved: true } : thread
        )
      )
    } catch (error) {
      console.error('Failed to resolve thread:', error)
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading comments...</div>
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-y-auto space-y-6 p-4">
        {threads.map((thread) => (
          <CommentThreadComponent
            key={thread.id}
            thread={thread}
            onAddComment={(content) => handleAddComment(content, thread.comments[0].id)}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onReactToComment={handleReactToComment}
            onResolveThread={() => handleResolveThread(thread.id)}
          />
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <textarea
          value={newCommentContent}
          onChange={(e) => setNewCommentContent(e.target.value)}
          placeholder="Write a comment..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          rows={3}
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => {
              if (newCommentContent.trim()) {
                handleAddComment(newCommentContent)
                setNewCommentContent('')
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  )
}
