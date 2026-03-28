'use client'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-4">
      <p className="text-sm text-destructive">{error.message || 'Something went wrong'}</p>
      <button
        onClick={reset}
        className="text-sm underline underline-offset-4 hover:text-foreground"
      >
        Try again
      </button>
    </div>
  )
}
