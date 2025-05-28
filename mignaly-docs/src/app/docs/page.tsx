import Link from 'next/link'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import SearchBar from '@/components/search-bar'

// This would normally be fetched from the database
const categories = [
  {
    id: '1',
    name: 'Getting Started',
    description: 'Everything you need to know to get started with our platform',
    documents: [
      { id: '1', title: 'Introduction', slug: 'introduction' },
      { id: '2', title: 'Installation', slug: 'installation' },
      { id: '3', title: 'Configuration', slug: 'configuration' },
    ],
  },
  {
    id: '2',
    name: 'Guides',
    description: 'Step-by-step guides for common tasks',
    documents: [
      { id: '4', title: 'User Management', slug: 'user-management' },
      { id: '5', title: 'Content Creation', slug: 'content-creation' },
      { id: '6', title: 'Advanced Features', slug: 'advanced-features' },
    ],
  },
  {
    id: '3',
    name: 'API Reference',
    description: 'Detailed API documentation for developers',
    documents: [
      { id: '7', title: 'Authentication', slug: 'api-authentication' },
      { id: '8', title: 'Endpoints', slug: 'api-endpoints' },
      { id: '9', title: 'Error Handling', slug: 'api-error-handling' },
    ],
  },
]

export default function DocsPage() {
  return (
    <div className="bg-white dark:bg-dark-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Documentation
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Find everything you need to know about our platform
            </p>
            <div className="mt-8 flex justify-center">
              <SearchBar />
            </div>
          </div>

          <div className="mt-16">
            {categories.map((category) => (
              <div key={category.id} className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{category.name}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{category.description}</p>
                
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {category.documents.map((doc) => (
                    <Link 
                      key={doc.id} 
                      href={`/docs/${doc.slug}`}
                      className="card p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <DocumentTextIcon className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{doc.title}</h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}