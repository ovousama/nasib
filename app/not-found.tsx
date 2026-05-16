import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-medium text-[#AF4D98] mb-2">Nasib</h1>

        <div className="mt-8 border border-gray-100 rounded-2xl shadow-sm p-8">
          <p className="text-6xl font-medium text-gray-100 mb-4">404</p>
          <h2 className="text-lg font-medium text-gray-800 mb-2">Page not found</h2>
          <p className="text-gray-400 text-sm mb-6">
            This page does not exist. Perhaps it was moved or the link is incorrect.
          </p>
          <Link
            href="/dashboard"
            className="inline-block w-full py-3 bg-[#AF4D98] text-white font-medium rounded-xl hover:bg-[#9B3D85] transition-colors text-sm"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
