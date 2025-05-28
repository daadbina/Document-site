"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useTheme } from 'next-themes'
import CommentSection from '@/components/comment-section'

export default function DocumentPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { theme } = useTheme()
  const [document, setDocument] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  
  useEffect(() => {
    fetchDocument()
  }, [params.slug, selectedVersion])
  
  const fetchDocument = async () => {
    try {
      const url = `/api/documents/slug/${params.slug}${selectedVersion ? `?version=${selectedVersion}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 404) {
          setDocument(null)
        } else {
          throw new Error('Failed to fetch document')
        }
      } else {
        const data = await response.json()
        setDocument(data)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching document:', error)
      setError('Failed to load document')
      setLoading(false)
    }
  }
  
  const handleExportPDF = async () => {
    if (!document) return
    
    try {
      // Create a form to submit the request
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/api/export/pdf'
      form.target = '_blank'
      
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'documentId'
      input.value = document.id
      
      form.appendChild(input)
      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <ArrowPathIcon className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    )
  }
  
  if (!document) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document not found</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          The document you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/docs" className="mt-4 inline-block text-primary-600 hover:text-primary-500">
          Back to documentation
        </Link>
      </div>
    )
  }
  
  return (
    <div className="bg-white dark:bg-dark-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Link href="/docs" className="hover:text-primary-600">
                  Documentation
                </Link>
                <span className="mx-2">/</span>
                <span>{document.title}</span>
              </div>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{document.title}</h1>
              {document.subtitle && (
                <p className="mt-2 text-xl text-gray-600 dark:text-gray-300">{document.subtitle}</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center rounded-md bg-white dark:bg-dark-100 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-dark-200"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                PDF
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="inline-flex items-center rounded-md bg-white dark:bg-dark-100 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-dark-200"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                Comments
              </button>
              {document.versions && document.versions.length > 1 && (
                <div className="relative inline-block text-left">
                  <select
                    className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-dark-100 sm:text-sm sm:leading-6"
                    value={selectedVersion || document.version}
                    onChange={(e) => setSelectedVersion(Number(e.target.value))}
                  >
                    {document.versions.map((version: any) => (
                      <option key={version.versionNumber} value={version.versionNumber}>
                        v{version.versionNumber} ({new Date(version.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {document.content}
            </ReactMarkdown>
          </div>
          
          {showComments && (
            <div className="mt-12">
              <CommentSection documentId={document.id} />
            </div>
          )}
          
          <div className="mt-12 flex justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
            {document.prevDoc ? (
              <Link
                href={`/docs/${document.prevDoc.slug}`}
                className="flex items-center text-primary-600 hover:text-primary-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                {document.prevDoc.title}
              </Link>
            ) : (
              <div></div>
            )}
            
            {document.nextDoc && (
              <Link
                href={`/docs/${document.nextDoc.slug}`}
                className="flex items-center text-primary-600 hover:text-primary-500"
              >
                {document.nextDoc.title}
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}