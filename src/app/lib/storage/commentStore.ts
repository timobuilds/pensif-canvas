import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Comment, CommentThread } from '../types/comments'
import { currentUser } from '@clerk/nextjs'
import { sharingManager } from '../sharing/sharingManager'

interface CommentDB extends DBSchema {
  comments: {
    key: string
    value: Comment
    indexes: {
      'by-project': string
      'by-frame': string
    }
  }
  threads: {
    key: string
    value: CommentThread
    indexes: {
      'by-project': string
    }
  }
}

class CommentStore {
  private db: IDBPDatabase<CommentDB> | null = null

  private async getDB() {
    if (!this.db) {
      this.db = await openDB<CommentDB>('pensif-comments', 1, {
        upgrade(db) {
          // Comments store
          const commentStore = db.createObjectStore('comments', {
            keyPath: 'id',
          })
          commentStore.createIndex('by-project', 'projectId')
          commentStore.createIndex('by-frame', 'frameId')

          // Threads store
          const threadStore = db.createObjectStore('threads', {
            keyPath: 'id',
          })
          threadStore.createIndex('by-project', 'projectId')
        },
      })
    }
    return this.db
  }

  async canComment(projectId: string): Promise<boolean> {
    const role = await sharingManager.getProjectAccess(projectId)
    return role === 'owner' || role === 'editor'
  }

  async addComment(
    projectId: string,
    content: string,
    frameId?: string,
    replyTo?: string
  ): Promise<Comment> {
    const user = await currentUser()
    if (!user) throw new Error('User not authenticated')

    const canComment = await this.canComment(projectId)
    if (!canComment) throw new Error('You do not have permission to comment')

    const db = await this.getDB()
    const comment: Comment = {
      id: crypto.randomUUID(),
      projectId,
      frameId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userAvatar: user.imageUrl,
      content,
      createdAt: new Date(),
      replyTo,
      reactions: {},
    }

    await db.add('comments', comment)
    return comment
  }

  async editComment(commentId: string, content: string): Promise<Comment> {
    const user = await currentUser()
    if (!user) throw new Error('User not authenticated')

    const db = await this.getDB()
    const comment = await db.get('comments', commentId)
    if (!comment) throw new Error('Comment not found')
    if (comment.userId !== user.id) throw new Error('Not authorized to edit this comment')

    const updatedComment: Comment = {
      ...comment,
      content,
      editedAt: new Date(),
    }

    await db.put('comments', updatedComment)
    return updatedComment
  }

  async deleteComment(commentId: string): Promise<void> {
    const user = await currentUser()
    if (!user) throw new Error('User not authenticated')

    const db = await this.getDB()
    const comment = await db.get('comments', commentId)
    if (!comment) throw new Error('Comment not found')
    if (comment.userId !== user.id) throw new Error('Not authorized to delete this comment')

    await db.delete('comments', commentId)
  }

  async getProjectComments(projectId: string): Promise<Comment[]> {
    const db = await this.getDB()
    return db.getAllFromIndex('comments', 'by-project', projectId)
  }

  async getFrameComments(frameId: string): Promise<Comment[]> {
    const db = await this.getDB()
    return db.getAllFromIndex('comments', 'by-frame', frameId)
  }

  async addReaction(commentId: string, emoji: string): Promise<Comment> {
    const user = await currentUser()
    if (!user) throw new Error('User not authenticated')

    const db = await this.getDB()
    const comment = await db.get('comments', commentId)
    if (!comment) throw new Error('Comment not found')

    // Toggle reaction
    if (!comment.reactions[emoji]) {
      comment.reactions[emoji] = []
    }

    const userIndex = comment.reactions[emoji].indexOf(user.id)
    if (userIndex === -1) {
      comment.reactions[emoji].push(user.id)
    } else {
      comment.reactions[emoji].splice(userIndex, 1)
      if (comment.reactions[emoji].length === 0) {
        delete comment.reactions[emoji]
      }
    }

    await db.put('comments', comment)
    return comment
  }

  async createThread(projectId: string): Promise<CommentThread> {
    const db = await this.getDB()
    const thread: CommentThread = {
      id: crypto.randomUUID(),
      comments: [],
      resolved: false,
    }

    await db.add('threads', thread)
    return thread
  }

  async resolveThread(threadId: string): Promise<CommentThread> {
    const user = await currentUser()
    if (!user) throw new Error('User not authenticated')

    const db = await this.getDB()
    const thread = await db.get('threads', threadId)
    if (!thread) throw new Error('Thread not found')

    const updatedThread: CommentThread = {
      ...thread,
      resolved: true,
      resolvedBy: user.id,
      resolvedAt: new Date(),
    }

    await db.put('threads', updatedThread)
    return updatedThread
  }
}

export const commentStore = new CommentStore()
