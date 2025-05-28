"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { TrashIcon } from '@heroicons/react/24/outline'

export default function CommentSection({ documentId }: { documentId: string }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    if (documentId) {
      fetchComments()
    }
  }, [documentId])
  
  const fetchComments = async () => {
    try {
      // In a real implementation, we would have a dedicated API endpoint for comments
      // For now, we'll use the document endpoint which includes comments
      const response = await fetch(`/api/documents/slug/${documentId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      
      const data = await response.json()
      setComments(data.comments || [])
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching comments:', error)
      setError('Failed to load comments')
      setIsLoading(false)
    }
  }
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          documentId,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to post comment')
      }
      
      const comment = await response.json()
      
      // Add the new comment to the list
      setComments([comment, ...comments])
      setNewComment('')
    } catch (error: any) {
      console.error('Error posting comment:', error)
      setError(error.message || 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete comment')
      }
      
      // Remove the deleted comment from the list
      setComments(comments.filter(comment => comment.id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment')
    }
  }
  
  return (
    <div className="bg-white dark:bg-dark-100 shadow sm:rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">Comments</h2>
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
        </div>
      )}
      
      {isLoading ? (
        <div className="mt-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading comments...</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {comments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  {comment.author.image ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={comment.author.image}
                      alt={comment.author.name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-300 font-medium">
                        {comment.author.name?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.author.name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    {session?.user?.email === comment.author.email && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </button>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {session ? (
        <div className="mt-6">
          <form onSubmit={handleSubmitComment}>
            <div className="mt-2">
              <textarea
                rows={3}
                name="comment"
                id="comment"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-dark-200 sm:text-sm sm:leading-6"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="btn-primary"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mt-6 rounded-md bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Please{' '}
                <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  sign in
                </Link>{' '}
                to leave a comment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}