export function SketchFrameIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 15L10 12L13 15L17 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 8L19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-pulse text-purple-400"/>
      <circle cx="19" cy="10" r="1" fill="currentColor" className="animate-pulse text-purple-400"/>
    </svg>
  )
}

export function ImageFrameIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 15L7 11L11 15L21 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
      <path d="M17 8L19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-pulse text-purple-400"/>
      <circle cx="19" cy="10" r="1" fill="currentColor" className="animate-pulse text-purple-400"/>
    </svg>
  )
}

export function ModelFrameIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 3V21" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 7.5L20 16.5" stroke="currentColor" strokeWidth="2"/>
      <path d="M20 7.5L4 16.5" stroke="currentColor" strokeWidth="2"/>
      <path d="M17 8L19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-pulse text-purple-400"/>
      <circle cx="19" cy="10" r="1" fill="currentColor" className="animate-pulse text-purple-400"/>
    </svg>
  )
}
