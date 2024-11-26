'use client';

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Canvas } from '@/app/components/canvas/Canvas'
import { Project } from '@/app/lib/types/canvas'
import { projectStore } from '@/app/lib/storage/projectStore'
import Link from 'next/link'

export default function CanvasPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProject()
  }, [params.id])

  async function loadProject() {
    if (!params.id) return

    try {
      const loadedProject = await projectStore.getProject(params.id as string)
      if (!loadedProject) {
        setError('Project not found')
        return
      }
      setProject(loadedProject)
    } catch (error) {
      console.error('Failed to load project:', error)
      setError('Failed to load project')
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col items-center justify-center">
        <div className="text-xl text-red-400 mb-4">{error}</div>
        <Link
          href="/projects"
          className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg"
        >
          Back to Projects
        </Link>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-neutral-900 text-neutral-100 flex items-center justify-center">
        <div className="text-4xl animate-pulse">💟</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0">
      <Canvas project={project} />
      <Link
        href="/projects"
        className="fixed top-4 left-4 px-4 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg z-50"
      >
        ← Back to Projects
      </Link>
    </div>
  )
}
