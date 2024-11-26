import Pusher from 'pusher-js'
import { type Point } from '../types/canvas'

export interface UserPresence {
  id: string
  name: string
  color: string
  cursor: Point | null
  lastSeen: Date
  isActive: boolean
}

export class PresenceManager {
  private pusher: Pusher
  private channel: any
  private userId: string
  private userName: string
  private userColor: string
  private onPresenceUpdate: (users: UserPresence[]) => void
  private presenceData: Map<string, UserPresence> = new Map()
  private cursorUpdateThrottle: number = 50 // ms
  private lastCursorUpdate: number = 0

  constructor(
    projectId: string,
    onPresenceUpdate: (users: UserPresence[]) => void
  ) {
    this.userId = crypto.randomUUID()
    this.userName = `User ${Math.floor(Math.random() * 1000)}`
    this.userColor = `hsl(${Math.random() * 360}, 70%, 50%)`
    this.onPresenceUpdate = onPresenceUpdate

    this.pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    this.channel = this.pusher.subscribe(`presence-canvas-${projectId}`)
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.channel.bind('pusher:subscription_succeeded', (members: any) => {
      members.each((member: any) => {
        this.presenceData.set(member.id, member.info)
      })
      this.updatePresence()
    })

    this.channel.bind('pusher:member_added', (member: any) => {
      this.presenceData.set(member.id, member.info)
      this.updatePresence()
    })

    this.channel.bind('pusher:member_removed', (member: any) => {
      this.presenceData.delete(member.id)
      this.updatePresence()
    })

    this.channel.bind('cursor-update', (data: { userId: string; cursor: Point }) => {
      const user = this.presenceData.get(data.userId)
      if (user) {
        user.cursor = data.cursor
        user.lastSeen = new Date()
        this.updatePresence()
      }
    })

    // Clean up inactive users
    setInterval(() => {
      const now = new Date()
      let hasChanges = false
      this.presenceData.forEach((user, id) => {
        if (now.getTime() - user.lastSeen.getTime() > 30000) { // 30 seconds
          user.isActive = false
          hasChanges = true
        }
      })
      if (hasChanges) {
        this.updatePresence()
      }
    }, 10000) // Check every 10 seconds
  }

  updateCursor(cursor: Point) {
    const now = Date.now()
    if (now - this.lastCursorUpdate < this.cursorUpdateThrottle) return

    this.lastCursorUpdate = now
    this.channel.trigger('client-cursor-update', {
      userId: this.userId,
      cursor,
    })

    const user = this.presenceData.get(this.userId)
    if (user) {
      user.cursor = cursor
      user.lastSeen = new Date()
      this.updatePresence()
    }
  }

  private updatePresence() {
    const users = Array.from(this.presenceData.values())
    this.onPresenceUpdate(users)
  }

  disconnect() {
    this.channel.unbind_all()
    this.pusher.unsubscribe(`presence-canvas-${this.projectId}`)
  }
}
