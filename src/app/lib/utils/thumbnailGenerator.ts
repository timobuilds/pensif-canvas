import { type Project } from '../types/canvas'
import html2canvas from 'html2canvas'

export class ThumbnailGenerator {
  static async generateThumbnail(project: Project): Promise<string> {
    // Create a temporary canvas container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '800px'
    container.style.height = '600px'
    container.style.backgroundColor = '#171717' // neutral-900
    document.body.appendChild(container)

    try {
      // Draw frames
      for (const frame of project.canvas.frames) {
        const frameElement = document.createElement('div')
        frameElement.style.position = 'absolute'
        frameElement.style.left = `${frame.position.x}px`
        frameElement.style.top = `${frame.position.y}px`
        frameElement.style.width = '320px'
        frameElement.style.height = '320px'
        frameElement.style.backgroundColor = '#262626' // neutral-800
        frameElement.style.border = '1px solid #404040' // neutral-700
        frameElement.style.borderRadius = '8px'
        frameElement.style.overflow = 'hidden'

        // Add frame content
        if (frame.type === 'sketch' && frame.content.sketch) {
          const img = document.createElement('img')
          img.src = frame.content.sketch
          img.style.width = '100%'
          img.style.height = '100%'
          img.style.objectFit = 'contain'
          frameElement.appendChild(img)
        } else if (frame.type === 'image' && frame.content.image) {
          const img = document.createElement('img')
          img.src = frame.content.image
          img.style.width = '100%'
          img.style.height = '100%'
          img.style.objectFit = 'cover'
          frameElement.appendChild(img)
        } else if (frame.type === 'model') {
          // Add a placeholder for 3D models
          frameElement.style.backgroundColor = '#422006' // warm-900
          const icon = document.createElement('div')
          icon.textContent = '🧊'
          icon.style.fontSize = '48px'
          icon.style.display = 'flex'
          icon.style.alignItems = 'center'
          icon.style.justifyContent = 'center'
          icon.style.height = '100%'
          frameElement.appendChild(icon)
        }

        container.appendChild(frameElement)
      }

      // Draw connections
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 600
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.strokeStyle = '#525252' // neutral-600
        ctx.lineWidth = 2

        for (const frame of project.canvas.frames) {
          const connections = project.canvas.frames.filter(f =>
            f.connections.includes(frame.id)
          )

          for (const connection of connections) {
            const fromCenter = {
              x: frame.position.x + 160,
              y: frame.position.y + 160,
            }
            const toCenter = {
              x: connection.position.x + 160,
              y: connection.position.y + 160,
            }

            ctx.beginPath()
            ctx.moveTo(fromCenter.x, fromCenter.y)
            ctx.lineTo(toCenter.x, toCenter.y)
            ctx.stroke()
          }
        }

        container.appendChild(canvas)
      }

      // Generate thumbnail
      const thumbnail = await html2canvas(container, {
        width: 800,
        height: 600,
        scale: 0.5, // Generate a 400x300 thumbnail
      })

      return thumbnail.toDataURL('image/jpeg', 0.8)
    } finally {
      document.body.removeChild(container)
    }
  }
}
