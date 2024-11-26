export type ShareRole = 'viewer' | 'editor' | 'owner'

export interface SharedUser {
  id: string
  email: string
  role: ShareRole
  addedAt: Date
}

export interface ShareSettings {
  projectId: string
  isPublic: boolean
  allowComments: boolean
  users: SharedUser[]
  inviteLink?: string
  inviteLinkExpiry?: Date
}

export interface ShareInvite {
  id: string
  projectId: string
  email: string
  role: ShareRole
  invitedBy: string
  invitedAt: Date
  expiresAt: Date
  accepted: boolean
  acceptedAt?: Date
}
