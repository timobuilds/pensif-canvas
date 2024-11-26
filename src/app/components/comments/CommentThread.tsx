import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Comment as CommentComponent } from './Comment'
import { Comment as CommentType, CommentThread as CommentThreadType } from '@/app/lib/types/comments'

interface CommentThreadProps {
  thread: CommentThreadType
  onAddComment: (content: string) => void
  onEditComment: (commentId: string, content: string) => void
  onDeleteComment: (commentId: string) => void
  onReactToComment: (commentId: string, emoji: string) => void
  onResolveThread: () => void
}

export function CommentThread({
  thread,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReactToComment,
  onResolveThread,
}: CommentThreadProps) {
  const { user } = useUser()
  const [replyContent, setReplyContent] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onAddComment(replyContent)
      setReplyContent('')
      setIsReplying(false)
    }
  }

  return (
    <div className="space-y-4">
      {thread.comments.map((comment) => (
        <div key={comment.id} className={comment.replyTo ? 'ml-8' : ''}>
          <CommentComponent
            comment={comment}
            onEdit={(content) => onEditComment(comment.id, content)}
            onDelete={() => onDeleteComment(comment.id)}
            onReact={(emoji) => onReactToComment(comment.id, emoji)}
            onReply={() => setIsReplying(true)}
          />
        </div>
      ))}

      {isReplying && (
        <div className="ml-8 mt-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows={3}
          />
          <div className="mt-2 flex justify-end space-x-2">
            <button
              onClick={() => setIsReplying(false)}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReply}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {!thread.resolved && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onResolveThread}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Resolve Thread
          </button>
        </div>
      )}
    </div>
  )
}
