'use client';

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SignIn } from '@clerk/nextjs'
import { sharingManager } from '@/app/lib/sharing/sharingManager'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    handleInvite()
  }, [params.id])

  async function handleInvite() {
    if (!params.id) return

    try {
      await sharingManager.acceptInvite(params.id as string)
      router.push('/projects')
    } catch (error: any) {
      console.error('Failed to accept invite:', error)
      setError(error.message || 'Failed to accept invite')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          Join Project
        </h1>

        {error ? (
          <div className="text-center">
            <div className="mb-4 p-3 bg-red-900/30 text-red-400 rounded-lg">
              {error}
            </div>
            <button
              onClick={() => router.push('/projects')}
              className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg"
            >
              Go to Projects
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center">
            <div className="animate-pulse text-2xl mb-4">💟</div>
            <div className="text-neutral-400">
              Accepting invitation...
            </div>
          </div>
        ) : (
          <SignIn />
        )}
      </div>
    </div>
  )
}
