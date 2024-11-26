'use client';

import { type Point } from '@/app/lib/types/canvas'
import { motion } from 'framer-motion'

interface UserCursorProps {
  name: string
  color: string
  position: Point
}

export function UserCursor({ name, color, position }: UserCursorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Cursor */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ color }}
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill="currentColor"
          stroke="white"
        />
      </svg>

      {/* Name tag */}
      <div
        className="absolute left-5 top-0 px-2 py-1 rounded-lg text-xs whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        <span className="text-white font-medium drop-shadow-sm">
          {name}
        </span>
      </div>
    </motion.div>
  )
}
