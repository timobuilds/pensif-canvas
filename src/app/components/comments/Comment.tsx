import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Comment as CommentType } from '@/app/lib/types/comments'
import { EmojiPicker } from './EmojiPicker'
import { formatDistanceToNow } from 'date-fns'
import { Menu } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

interface CommentProps {
  comment: CommentType
  onEdit: (content: string) => void
  onDelete: () => void
  onReact: (emoji: string) => void
  onReply: () => void
}

export function Comment({ comment, onEdit, onDelete, onReact, onReply }: CommentProps) {
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const isAuthor = user?.id === comment.userId
  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })

  const handleSaveEdit = () => {
    onEdit(editContent)
    setIsEditing(false)
  }

  const handleReaction = (emoji: string) => {
    onReact(emoji)
    setShowEmojiPicker(false)
  }

  return (
    <div className="flex space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <img
        src={comment.userAvatar || '/default-avatar.png'}
        alt={comment.userName}
        className="w-10 h-10 rounded-full"
      />
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-gray-900 dark:text-white">
              {comment.userName}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              {formattedDate}
              {comment.editedAt && ' (edited)'}
            </span>
          </div>

          {isAuthor && (
            <Menu as="div" className="relative">
              <Menu.Button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 w-full text-left`}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } block px-4 py-2 text-sm text-red-600 dark:text-red-400 w-full text-left`}
                      onClick={onDelete}
                    >
                      Delete
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
            />
            <div className="mt-2 flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>
        )}

        <div className="mt-3 flex items-center space-x-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            React
          </button>
          <button
            onClick={onReply}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Reply
          </button>

          {showEmojiPicker && (
            <div className="absolute mt-1">
              <EmojiPicker onSelect={handleReaction} />
            </div>
          )}
        </div>

        {Object.entries(comment.reactions).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(comment.reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => onReact(emoji)}
                className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                  users.includes(user?.id || '')
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <span>{emoji}</span>
                <span className="ml-1">{users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
