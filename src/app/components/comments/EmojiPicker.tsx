import { useEffect, useRef } from 'react'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

const COMMON_EMOJIS = ['👍', '❤️', '😊', '🎉', '🤔', '👀', '🚀', '💯']

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onSelect('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onSelect])

  return (
    <div
      ref={pickerRef}
      className="absolute z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1"
    >
      {COMMON_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
