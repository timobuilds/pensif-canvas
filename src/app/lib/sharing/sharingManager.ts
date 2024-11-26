import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { ShareSettings, ShareInvite, ShareRole } from '../types/sharing'
import { currentUser } from '@clerk/nextjs'

interface SharingDB extends DBSchema {
  settings: {
    key: string
    value: ShareSettings
  }
  invites: {
    key: string
    value: ShareInvite
  }
}

class SharingManager {
  private db: IDBPDatabase<SharingDB> | null = null

  private async getDB() {
    if (!this.db) {
      this.db = await openDB<SharingDB>('pensif-sharing', 1, {
        upgrade(db) {
          db.createObjectStore('settings')
          db.createObjectStore('invites')
        },
      })
    }
    return this.db
  }

  async getProjectAccess(projectId: string): Promise<ShareRole | null> {
    const user = await currentUser()
    if (!user) return null

    const settings = await this.getShareSettings(projectId)
    if (!settings) return null

    const userShare = settings.users.find(u => u.id === user.id)
    return userShare?.role || null
  }

  async getShareSettings(projectId: string): Promise<ShareSettings | null> {
    const db = await this.getDB()
    return db.get('settings', projectId)
  }

  async updateShareSettings(settings: ShareSettings): Promise<void> {
    const db = await this.getDB()
    await db.put('settings', settings, settings.projectId)
  }

  async createInviteLink(projectId: string, role: ShareRole): Promise<string> {
    const user = await currentUser()
    if (!user) throw new Error('User not authenticated')

    const settings = await this.getShareSettings(projectId)
    if (!settings) throw new Error('Project not found')

    const inviteId = crypto.randomUUID()
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7) // 7 days expiry

    settings.inviteLink = inviteId
    settings.inviteLinkExpiry = expiryDate

    await this.updateShareSettings(settings)

    return `${window.location.origin}/invite/${inviteId}`
  }

  async inviteUser(projectId: string, email: string, role: ShareRole): Promise<void> {
    const user = await currentUser()
    if (!user) throw new Error('User not authenticated')

    const db = await this.getDB()
    const invite: ShareInvite = {
      id: crypto.randomUUID(),
      projectId,
      email,
      role,
      invitedBy: user.id,
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      accepted: false,
    }

    await db.put('invites', invite, invite.id)

    // TODO: Send email invitation using your email service
    console.log('Sending invite email to:', email)
  }

  async acceptInvite(inviteId: string): Promise<void> {
    const user = await currentUser()
    if (!user) throw new Error('User not authenticated')

    const db = await this.getDB()
    const invite = await db.get('invites', inviteId)
    if (!invite) throw new Error('Invite not found')
    if (invite.accepted) throw new Error('Invite already accepted')
    if (invite.expiresAt < new Date()) throw new Error('Invite expired')

    // Update invite
    invite.accepted = true
    invite.acceptedAt = new Date()
    await db.put('invites', invite, inviteId)

    // Add user to project
    const settings = await this.getShareSettings(invite.projectId)
    if (!settings) throw new Error('Project not found')

    settings.users.push({
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      role: invite.role,
      addedAt: new Date(),
    })

    await this.updateShareSettings(settings)
  }

  async removeUser(projectId: string, userId: string): Promise<void> {
    const currentUserData = await currentUser()
    if (!currentUserData) throw new Error('User not authenticated')

    const settings = await this.getShareSettings(projectId)
    if (!settings) throw new Error('Project not found')

    const currentUserRole = settings.users.find(u => u.id === currentUserData.id)?.role
    if (currentUserRole !== 'owner') throw new Error('Only owners can remove users')

    settings.users = settings.users.filter(u => u.id !== userId)
    await this.updateShareSettings(settings)
  }

  async updateUserRole(projectId: string, userId: string, newRole: ShareRole): Promise<void> {
    const currentUserData = await currentUser()
    if (!currentUserData) throw new Error('User not authenticated')

    const settings = await this.getShareSettings(projectId)
    if (!settings) throw new Error('Project not found')

    const currentUserRole = settings.users.find(u => u.id === currentUserData.id)?.role
    if (currentUserRole !== 'owner') throw new Error('Only owners can update roles')

    const userToUpdate = settings.users.find(u => u.id === userId)
    if (!userToUpdate) throw new Error('User not found')

    userToUpdate.role = newRole
    await this.updateShareSettings(settings)
  }
}

export const sharingManager = new SharingManager()
