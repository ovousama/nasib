'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-medium text-[#AF4D98] mb-2">Nasib</h1>

        <div className="mt-8 bg-red-50 border border-red-100 rounded-2xl p-8">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-6">
            An unexpected error occurred. Please try again — if it persists, contact support.
          </p>
          <button
            onClick={reset}
            className="w-full py-3 bg-[#AF4D98] text-white font-medium rounded-xl hover:bg-[#9B3D85] transition-colors text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
