'use client';

import { Canvas } from './components/canvas/Canvas'
import { projectStore } from './lib/storage/projectStore'
import { useEffect, useState } from 'react'
import { type Project } from './lib/types/canvas'

export default function Home() {
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const loadProject = async () => {
      // Create a new project if none exists
      const newProject: Project = {
        id: 'default',
        name: 'Untitled Project',
        created: new Date(),
        lastModified: new Date(),
        canvas: {
          frames: [],
          apiUsage: {
            fluxSchnell: { calls: 0, spend: 0 },
            removeBg: { calls: 0, spend: 0 },
            tripoSr: { calls: 0, spend: 0 },
          },
          spendLimit: 100,
        },
      }
      
      await projectStore.saveProject(newProject)
      setProject(newProject)
    }

    loadProject()
  }, [])

  if (!project) {
    return <div>Loading...</div>
  }

  return (
    <main className="flex h-screen w-full flex-col items-center bg-neutral-50 dark:bg-neutral-900">
      <div className="flex w-full flex-col items-center gap-4 p-4">
        <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-200">
          Pensif Canvas
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          A collaborative canvas for creative exploration
        </p>
        <div className="relative h-[calc(100vh-200px)] w-full max-w-[1200px] overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <Canvas project={project} />
        </div>
      </div>
    </main>
  );
}