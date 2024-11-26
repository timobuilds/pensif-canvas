'use client';

interface DownloadButtonProps {
  content: string | undefined
  type: 'sketch' | 'image' | 'model'
  filename: string
}

export function DownloadButton({ content, type, filename }: DownloadButtonProps) {
  if (!content) return null

  const handleDownload = () => {
    const mimeTypes = {
      sketch: 'image/png',
      image: 'image/png',
      model: 'model/gltf-binary',
    }

    // Convert base64 to blob
    const base64 = content.split(',')[1]
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: mimeTypes[type] })

    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const icons = {
    sketch: '✏️',
    image: '🖼️',
    model: '🧊',
  }

  return (
    <button
      onClick={handleDownload}
      className="absolute top-2 right-2 p-2 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg text-neutral-100 z-10 transition-colors"
      title={`Download ${type}`}
    >
      {icons[type]} ↓
    </button>
  )
}
