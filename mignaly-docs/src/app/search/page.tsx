"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query])
  
  const performSearch = async (q: string) => {
    if (!q.trim()) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error searching:', error)
      setError('Failed to perform search. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    // Update the URL with the search query
    const url = new URL(window.location.href)
    url.searchParams.set('q', searchQuery)
    window.history.pushState({}, '', url.toString())
    
    performSearch(searchQuery)
  }
  
  return (
    <div className="bg-white dark:bg-dark-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Search Documentation
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Find the information you need in our documentation
            </p>
            <div className="mt-8 flex justify-center">
              <form onSubmit={handleSearch} className="w-full max-w-2xl">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-md border-0 py-3 pl-4 pr-10 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-dark-200 sm:text-sm sm:leading-6"
                    placeholder="Search documentation..."
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {error && (
            <div className="mt-8 max-w-3xl mx-auto rounded-md bg-red-50 dark:bg-red-900/30 p-4">
              <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
            </div>
          )}
          
          {isLoading ? (
            <div className="mt-16 flex justify-center">
              <ArrowPathIcon className="h-8 w-8 text-primary-600 animate-spin" />
            </div>
          ) : (
            <div className="mt-16 max-w-3xl mx-auto">
              {query && (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {results.length === 0
                    ? 'No results found'
                    : `${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`}
                </h2>
              )}
              
              <div className="space-y-8">
                {results.map((result) => (
                  <div key={result.id} className="card p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      <Link href={`/docs/${result.slug}`} className="hover:text-primary-600">
                        {result.title}
                      </Link>
                    </h3>
                    {result.subtitle && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{result.subtitle}</p>
                    )}
                    {result.category && (
                      <div className="mt-2">
                        <span className="inline-flex items-center rounded-md bg-primary-50 dark:bg-primary-900/30 px-2 py-1 text-xs font-medium text-primary-700 dark:text-primary-300">
                          {result.category.name}
                        </span>
                      </div>
                    )}
                    {result.contentSnippet && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <p dangerouslySetInnerHTML={{ __html: highlightSearchTerm(result.contentSnippet, query) }} />
                      </div>
                    )}
                    <div className="mt-3">
                      <Link
                        href={`/docs/${result.slug}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        Read more <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to highlight search terms in the content snippet
function highlightSearchTerm(text: string, query: string): string {
  if (!query) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">$1</mark>')
}