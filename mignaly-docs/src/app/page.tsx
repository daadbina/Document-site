import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import FeaturedDocs from '@/components/featured-docs'
import SearchBar from '@/components/search-bar'

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-white to-gray-100 dark:from-dark-200 dark:to-dark-300">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Mignaly Documentation
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Comprehensive documentation platform with powerful search, version control, and collaboration features.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Documentation */}
      <div className="bg-white dark:bg-dark-100 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Documentation</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to know
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Browse our featured documentation or search for specific topics.
            </p>
          </div>
          
          <FeaturedDocs />
          
          <div className="mt-16 flex justify-center">
            <Link 
              href="/docs" 
              className="flex items-center text-primary-600 hover:text-primary-500 font-medium"
            >
              View all documentation
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}