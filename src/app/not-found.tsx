import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center max-w-md px-4">
        <div className="text-8xl font-bold text-upisha-teal/20 mb-4">404</div>
        <h1 className="text-3xl font-bold text-upisha-navy dark:text-white mb-3">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-upisha-teal text-white font-medium hover:bg-upisha-teal-dark transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}