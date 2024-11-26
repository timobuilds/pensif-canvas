import Pusher from 'pusher-js'
import { type Frame, type Connection, type Project } from '../types/canvas'

interface CanvasUpdate {
  type: 'frame_added' | 'frame_updated' | 'frame_deleted' | 'connection_added' | 'connection_updated' | 'connection_deleted'
  projectId: string
  userId: string
  data: any
}

export class RealtimeManager {
  private pusher: Pusher
  private channel: any
  private projectId: string
  private userId: string
  private onUpdate: (update: CanvasUpdate) => void

  constructor(projectId: string, onUpdate: (update: CanvasUpdate) => void) {
    this.projectId = projectId
    this.userId = crypto.randomUUID() // Generate unique user ID
    this.onUpdate = onUpdate

    this.pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    this.channel = this.pusher.subscribe(`canvas-${projectId}`)
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.channel.bind('canvas-update', (data: CanvasUpdate) => {
      // Ignore updates from self
      if (data.userId === this.userId) return
      this.onUpdate(data)
    })
  }

  async frameAdded(frame: Frame) {
    await this.sendUpdate({
      type: 'frame_added',
      projectId: this.projectId,
      userId: this.userId,
      data: frame,
    })
  }

  async frameUpdated(frame: Frame) {
    await this.sendUpdate({
      type: 'frame_updated',
      projectId: this.projectId,
      userId: this.userId,
      data: frame,
    })
  }

  async frameDeleted(frameId: string) {
    await this.sendUpdate({
      type: 'frame_deleted',
      projectId: this.projectId,
      userId: this.userId,
      data: { frameId },
    })
  }

  async connectionAdded(connection: Connection) {
    await this.sendUpdate({
      type: 'connection_added',
      projectId: this.projectId,
      userId: this.userId,
      data: connection,
    })
  }

  async connectionUpdated(connection: Connection) {
    await this.sendUpdate({
      type: 'connection_updated',
      projectId: this.projectId,
      userId: this.userId,
      data: connection,
    })
  }

  async connectionDeleted(connectionId: string) {
    await this.sendUpdate({
      type: 'connection_deleted',
      projectId: this.projectId,
      userId: this.userId,
      data: { connectionId },
    })
  }

  private async sendUpdate(update: CanvasUpdate) {
    try {
      await fetch('/api/realtime/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      })
    } catch (error) {
      console.error('Failed to send realtime update:', error)
    }
  }

  disconnect() {
    this.channel.unbind_all()
    this.pusher.unsubscribe(`canvas-${this.projectId}`)
  }
}
