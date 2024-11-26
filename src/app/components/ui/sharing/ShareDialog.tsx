'use client';

import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { ShareSettings, ShareRole } from '@/app/lib/types/sharing'
import { sharingManager } from '@/app/lib/sharing/sharingManager'

interface ShareDialogProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export function ShareDialog({ projectId, isOpen, onClose }: ShareDialogProps) {
  const [settings, setSettings] = useState<ShareSettings | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<ShareRole>('viewer')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen, projectId])

  async function loadSettings() {
    try {
      const settings = await sharingManager.getShareSettings(projectId)
      setSettings(settings)
    } catch (error) {
      console.error('Failed to load share settings:', error)
      setError('Failed to load share settings')
    }
  }

  async function handleInviteUser(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      await sharingManager.inviteUser(projectId, inviteEmail, inviteRole)
      setInviteEmail('')
      await loadSettings()
    } catch (error) {
      console.error('Failed to invite user:', error)
      setError('Failed to invite user')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateInviteLink() {
    setIsLoading(true)
    setError(null)

    try {
      const link = await sharingManager.createInviteLink(projectId, 'viewer')
      // Copy link to clipboard
      await navigator.clipboard.writeText(link)
      alert('Invite link copied to clipboard!')
    } catch (error) {
      console.error('Failed to create invite link:', error)
      setError('Failed to create invite link')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRemoveUser(userId: string) {
    if (!confirm('Are you sure you want to remove this user?')) return

    setIsLoading(true)
    setError(null)

    try {
      await sharingManager.removeUser(projectId, userId)
      await loadSettings()
    } catch (error) {
      console.error('Failed to remove user:', error)
      setError('Failed to remove user')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdateRole(userId: string, newRole: ShareRole) {
    setIsLoading(true)
    setError(null)

    try {
      await sharingManager.updateUserRole(projectId, userId, newRole)
      await loadSettings()
    } catch (error) {
      console.error('Failed to update user role:', error)
      setError('Failed to update user role')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />

      <div className="relative bg-neutral-800 rounded-lg p-6 w-full max-w-2xl">
        <Dialog.Title className="text-2xl font-bold mb-6">
          Share Project
        </Dialog.Title>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Invite Form */}
        <form onSubmit={handleInviteUser} className="mb-8">
          <div className="flex gap-4">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg"
              disabled={isLoading}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as ShareRole)}
              className="px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg"
              disabled={isLoading}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium disabled:opacity-50"
            >
              Invite
            </button>
          </div>
        </form>

        {/* Invite Link */}
        <div className="mb-8">
          <button
            onClick={handleCreateInviteLink}
            disabled={isLoading}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg"
          >
            Create Invite Link
          </button>
        </div>

        {/* Shared Users */}
        <div>
          <h3 className="text-lg font-medium mb-4">Shared With</h3>
          <div className="space-y-4">
            {settings?.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg"
              >
                <div>
                  <div className="font-medium">{user.email}</div>
                  <div className="text-sm text-neutral-400">
                    Added {new Date(user.addedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleUpdateRole(user.id, e.target.value as ShareRole)
                    }
                    className="px-3 py-1 bg-neutral-600 rounded-lg"
                    disabled={isLoading}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="owner">Owner</option>
                  </select>
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    disabled={isLoading || user.role === 'owner'}
                    className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {settings?.users.length === 0 && (
              <div className="text-center text-neutral-400 py-8">
                No users shared with yet
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-300"
        >
          ✕
        </button>
      </div>
    </Dialog>
  )
}
