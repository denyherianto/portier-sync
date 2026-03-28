'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function IntegrationsError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-red-600">{error.message || 'Failed to load integrations'}</p>
      <button
        onClick={reset}
        className="text-sm underline underline-offset-4 text-gray-600 hover:text-gray-900"
      >
        Try again
      </button>
    </div>
  )
}
