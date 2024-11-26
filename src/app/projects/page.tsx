'use client';

import { useEffect, useState, useRef } from 'react'
import { ProjectMetadata } from '../lib/types/project'
import { projectStore } from '../lib/storage/projectStore'
import { ProjectExporter } from '../lib/utils/projectExporter'
import Link from 'next/link'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectMetadata[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    const projectList = await projectStore.listProjects()
    setProjects(projectList.sort((a, b) => 
      b.lastModified.getTime() - a.lastModified.getTime()
    ))
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    if (!newProjectName.trim()) return

    setIsCreating(true)
    try {
      const project = await projectStore.createProject(newProjectName)
      setNewProjectName('')
      await loadProjects()
      // Redirect to the new project
      window.location.href = `/canvas/${project.id}`
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await projectStore.deleteProject(id)
      await loadProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  async function handleExportProject(id: string, name: string) {
    try {
      const project = await projectStore.getProject(id)
      if (!project) return

      const blob = await ProjectExporter.exportProject(project)
      ProjectExporter.downloadProject(blob, name)
    } catch (error) {
      console.error('Failed to export project:', error)
    }
  }

  async function handleImportProject(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const project = await ProjectExporter.importProject(file)
      await projectStore.saveProject(project)
      await loadProjects()
    } catch (error) {
      console.error('Failed to import project:', error)
      alert('Failed to import project. Please make sure the file is valid.')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Projects</h1>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pensif"
                onChange={handleImportProject}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg"
              >
                Import Project
              </button>
            </div>
          </div>
          <form onSubmit={handleCreateProject} className="flex gap-4">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="New project name..."
              className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg"
            />
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700"
            >
              {project.thumbnail ? (
                <img
                  src={project.thumbnail}
                  alt={project.name}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-neutral-700 flex items-center justify-center">
                  No Preview
                </div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-medium mb-2">{project.name}</h2>
                <div className="text-sm text-neutral-400 mb-4">
                  <div>Last modified: {new Date(project.lastModified).toLocaleDateString()}</div>
                  <div>API Calls: {project.apiUsage.totalCalls}</div>
                  <div>Total Spend: ${project.apiUsage.totalSpend.toFixed(2)}</div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/canvas/${project.id}`}
                    className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-center"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => handleExportProject(project.id, project.name)}
                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center text-neutral-400 mt-12">
            No projects yet. Create one to get started!
          </div>
        )}
      </div>
    </div>
  )
}
