export interface Comment {
  id: string
  projectId: string
  frameId?: string // Optional, for frame-specific comments
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: Date
  editedAt?: Date
  replyTo?: string // ID of parent comment
  reactions: {
    [key: string]: string[] // emoji -> userIds
  }
}

export interface CommentThread {
  id: string
  comments: Comment[]
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
}
