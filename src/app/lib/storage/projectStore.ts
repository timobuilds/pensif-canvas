import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Project } from '../types/canvas'
import { ProjectMetadata, ProjectStore } from '../types/project'
import { ThumbnailGenerator } from '../utils/thumbnailGenerator'

interface ProjectDB extends DBSchema {
  projects: {
    key: string
    value: Project
  }
  metadata: {
    key: string
    value: ProjectMetadata
  }
}

class IndexedDBProjectStore implements ProjectStore {
  private db: IDBPDatabase<ProjectDB> | null = null
  projects = new Map<string, Project>()

  private async getDB() {
    if (!this.db) {
      this.db = await openDB<ProjectDB>('pensif-canvas', 1, {
        upgrade(db) {
          db.createObjectStore('projects')
          db.createObjectStore('metadata')
        },
      })
    }
    return this.db
  }

  async getProject(id: string): Promise<Project | null> {
    const db = await this.getDB()
    const project = await db.get('projects', id)
    if (project) {
      this.projects.set(id, project)
    }
    return project || null
  }

  async saveProject(project: Project): Promise<void> {
    const db = await this.getDB()
    await db.put('projects', project, project.id)
    
    // Generate thumbnail
    let thumbnail: string | undefined
    try {
      thumbnail = await ThumbnailGenerator.generateThumbnail(project)
    } catch (error) {
      console.error('Failed to generate thumbnail:', error)
    }

    // Update metadata
    const metadata: ProjectMetadata = {
      id: project.id,
      name: project.name,
      created: project.created,
      lastModified: new Date(),
      thumbnail,
      apiUsage: {
        totalCalls: Object.values(project.canvas.apiUsage).reduce(
          (acc, curr) => acc + curr.calls,
          0
        ),
        totalSpend: Object.values(project.canvas.apiUsage).reduce(
          (acc, curr) => acc + curr.spend,
          0
        ),
      },
    }
    await db.put('metadata', metadata, project.id)
  }

  async deleteProject(id: string): Promise<void> {
    const db = await this.getDB()
    await db.delete('projects', id)
    await db.delete('metadata', id)
    this.projects.delete(id)
  }

  async listProjects(): Promise<ProjectMetadata[]> {
    const db = await this.getDB()
    const metadata = await db.getAll('metadata')
    return metadata
  }

  async createProject(name: string): Promise<Project> {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
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

    await this.saveProject(project)
    return project
  }
}

export const projectStore = new IndexedDBProjectStore()
