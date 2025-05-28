"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

// Import ReactQuill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image', 'video'],
    ['blockquote', 'code-block'],
    ['clean']
  ],
}

export default function DocumentEditor({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [document, setDocument] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  
  // Form state
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [content, setContent] = useState('')
  const [slug, setSlug] = useState('')
  const [published, setPublished] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  
  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    if (status === 'authenticated') {
      // Fetch categories
      fetchCategories()
      
      if (params.id === 'new') {
        setDocument({
          id: 'new',
          title: '',
          subtitle: '',
          content: '',
          slug: '',
          published: false,
          categoryId: '',
        })
        setLoading(false)
      } else {
        fetchDocument(params.id)
      }
    }
  }, [params.id, router, status])
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Failed to load categories')
    }
  }
  
  const fetchDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch document')
      }
      
      const data = await response.json()
      setDocument(data)
    } catch (error) {
      console.error('Error fetching document:', error)
      setError('Failed to load document')
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (document) {
      setTitle(document.title || '')
      setSubtitle(document.subtitle || '')
      setContent(document.content || '')
      setSlug(document.slug || '')
      setPublished(document.published || false)
      setCategoryId(document.categoryId || '')
      setLoading(false)
    }
  }, [document])
  
  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
  }
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    
    // Only auto-generate slug if it's a new document or slug is empty
    if (params.id === 'new' || !slug) {
      setSlug(generateSlug(newTitle))
    }
  }
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    
    const documentData = {
      title,
      subtitle,
      content,
      slug,
      published,
      categoryId: categoryId || null,
    }
    
    try {
      const url = params.id === 'new' 
        ? '/api/documents' 
        : `/api/documents/${params.id}`
      
      const method = params.id === 'new' ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save document')
      }
      
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error saving document:', error)
      setError(error.message || 'Failed to save document')
      setSaving(false)
    }
  }
  
  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <ArrowPathIcon className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
            {params.id === 'new' ? 'Create New Document' : 'Edit Document'}
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
              </div>
            )}
            
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Title
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={title}
                      onChange={handleTitleChange}
                      required
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-dark-200 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="subtitle" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Subtitle
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="subtitle"
                      id="subtitle"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-dark-200 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="slug" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Slug
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="slug"
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-dark-200 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Category
                  </label>
                  <div className="mt-2">
                    <select
                      id="category"
                      name="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-dark-200 sm:text-sm sm:leading-6"
                    >
                      <option value="">None</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="content" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                    Content
                  </label>
                  <div className="mt-2">
                    <ReactQuill 
                      theme="snow" 
                      value={content} 
                      onChange={setContent}
                      modules={modules}
                      className="bg-white dark:bg-dark-200 text-gray-900 dark:text-white rounded-md"
                      style={{ height: '400px', marginBottom: '50px' }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="published"
                    name="published"
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Published
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}