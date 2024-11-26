import { type Project } from '../types/canvas'
import JSZip from 'jszip'

export class ProjectExporter {
  static async exportProject(project: Project): Promise<Blob> {
    const zip = new JSZip()

    // Add project metadata
    zip.file('project.json', JSON.stringify({
      id: project.id,
      name: project.name,
      created: project.created,
      lastModified: project.lastModified,
      canvas: {
        frames: project.canvas.frames,
        apiUsage: project.canvas.apiUsage,
        spendLimit: project.canvas.spendLimit,
      },
    }, null, 2))

    // Add frame assets
    const assets = zip.folder('assets')
    if (assets) {
      for (const frame of project.canvas.frames) {
        if (frame.type === 'sketch' && frame.content.sketch) {
          assets.file(`${frame.id}-sketch.png`, frame.content.sketch)
        }
        if (frame.type === 'image' && frame.content.image) {
          assets.file(`${frame.id}-image.png`, frame.content.image)
        }
        if (frame.type === 'model' && frame.content.model) {
          assets.file(`${frame.id}-model.glb`, frame.content.model)
        }
      }
    }

    return await zip.generateAsync({ type: 'blob' })
  }

  static async importProject(file: File): Promise<Project> {
    const zip = new JSZip()
    const contents = await zip.loadAsync(file)

    // Load project metadata
    const projectJson = await contents.file('project.json')?.async('string')
    if (!projectJson) {
      throw new Error('Invalid project file: missing project.json')
    }

    const project: Project = JSON.parse(projectJson)

    // Load frame assets
    const assets = contents.folder('assets')
    if (assets) {
      for (const frame of project.canvas.frames) {
        if (frame.type === 'sketch') {
          const sketch = await assets.file(`${frame.id}-sketch.png`)?.async('base64')
          if (sketch) {
            frame.content.sketch = `data:image/png;base64,${sketch}`
          }
        }
        if (frame.type === 'image') {
          const image = await assets.file(`${frame.id}-image.png`)?.async('base64')
          if (image) {
            frame.content.image = `data:image/png;base64,${image}`
          }
        }
        if (frame.type === 'model') {
          const model = await assets.file(`${frame.id}-model.glb`)?.async('base64')
          if (model) {
            frame.content.model = `data:model/gltf-binary;base64,${model}`
          }
        }
      }
    }

    return project
  }

  static downloadProject(blob: Blob, projectName: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName}.pensif`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
