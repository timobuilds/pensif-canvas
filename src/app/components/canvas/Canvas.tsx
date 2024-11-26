'use client';

import { Tldraw, createTLStore, defaultShapeUtils, Editor } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { useCallback, useState, useEffect } from 'react'
import { SketchFrameUtil } from './frames/SketchFrame'
import { ImageFrameUtil } from './frames/ImageFrame'
import { ModelFrameUtil } from './frames/ModelFrame'
import { AIModelManager } from '../ui/ai-manager/AIModelManager'
import { type ApiUsage, type Project } from '@/app/lib/types/canvas'
import { updateConnectionPoints } from '@/app/lib/utils/connections'
import { ConnectionManager } from '@/app/lib/utils/connectionManager'
import { PresenceManager, type UserPresence } from '@/app/lib/realtime/presenceManager'
import { UserCursor } from '../ui/presence/UserCursor'
import { DownloadButton } from '../ui/frame-actions/DownloadButton'
import { projectStore } from '@/app/lib/storage/projectStore'
import { AnimatePresence } from 'framer-motion'

interface CanvasProps {
  project: Project
}

export function Canvas({ project }: CanvasProps) {
  const [apiUsage, setApiUsage] = useState<ApiUsage>(project.canvas.apiUsage)
  const [spendLimit, setSpendLimit] = useState(project.canvas.spendLimit)
  const [users, setUsers] = useState<UserPresence[]>([])
  const [connectionManager] = useState(() => new ConnectionManager())
  const [presenceManager] = useState(() => 
    new PresenceManager(project.id, setUsers)
  )

  useEffect(() => {
    // Save project periodically
    const saveInterval = setInterval(async () => {
      await projectStore.saveProject({
        ...project,
        canvas: {
          ...project.canvas,
          apiUsage,
          spendLimit,
        },
      })
    }, 30000) // Save every 30 seconds

    return () => {
      clearInterval(saveInterval)
      presenceManager.disconnect()
    }
  }, [project, apiUsage, spendLimit])

  const handleMount = useCallback((editor: Editor) => {
    // Register custom shapes
    editor.registerShapeUtils([
      SketchFrameUtil,
      ImageFrameUtil,
      ModelFrameUtil,
    ])

    // Add custom tools to toolbar
    editor.addToolbarItems([
      {
        id: 'frame.sketch',
        label: 'Sketch Frame',
        icon: '✏️✨',
        onSelect: () => {
          editor.createShape({
            type: 'sketch-frame',
            x: 100,
            y: 100,
          })
        },
      },
      {
        id: 'frame.image',
        label: 'Image Frame',
        icon: '🖼️✨',
        onSelect: () => {
          editor.createShape({
            type: 'image-frame',
            x: 100,
            y: 100,
          })
        },
      },
      {
        id: 'frame.model',
        label: 'Model Frame',
        icon: '🧊✨',
        onSelect: () => {
          editor.createShape({
            type: 'model-frame',
            x: 100,
            y: 100,
          })
        },
      },
    ])

    // Handle frame movements to update connections
    editor.on('frame-moved', (frame: any) => {
      connectionManager.updateConnectionPoints(editor.getShapes())
    })

    // Handle cursor movement
    editor.on('pointer-move', (e: any) => {
      presenceManager.updateCursor({ x: e.x, y: e.y })
    })
  }, [])

  const handleApiKeyChange = useCallback((model: keyof ApiUsage, key: string) => {
    // Store API key securely (we'll implement this later)
    console.log(`Setting ${model} API key:`, key)
  }, [])

  return (
    <div className="fixed inset-0 bg-neutral-900">
      <Tldraw
        persistenceKey={`pensif-canvas-${project.id}`}
        onMount={handleMount}
        darkMode={true}
        shapeUtils={[...defaultShapeUtils]}
      />

      {/* User cursors */}
      <AnimatePresence>
        {users.map((user) => (
          user.cursor && (
            <UserCursor
              key={user.id}
              name={user.name}
              color={user.color}
              position={user.cursor}
            />
          )
        ))}
      </AnimatePresence>

      <AIModelManager
        apiUsage={apiUsage}
        spendLimit={spendLimit}
        onSpendLimitChange={setSpendLimit}
        onApiKeyChange={handleApiKeyChange}
      />
      <DownloadButton />
    </div>
  )
}
