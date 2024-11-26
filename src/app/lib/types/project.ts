import { Project } from './canvas'

export interface ProjectMetadata {
  id: string
  name: string
  created: Date
  lastModified: Date
  thumbnail?: string
  apiUsage: {
    totalCalls: number
    totalSpend: number
  }
}

export interface ProjectStore {
  projects: Map<string, Project>
  getProject: (id: string) => Promise<Project | null>
  saveProject: (project: Project) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  listProjects: () => Promise<ProjectMetadata[]>
  createProject: (name: string) => Promise<Project>
}
