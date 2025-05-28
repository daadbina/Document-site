import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/search?q=query - Search for documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }
    
    // Search in title, subtitle, and content
    const documents = await prisma.document.findMany({
      where: {
        published: true,
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            subtitle: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        slug: true,
        content: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
    })
    
    // Process the results to include a snippet of content around the search term
    const results = documents.map(doc => {
      let contentSnippet = ''
      
      if (doc.content.toLowerCase().includes(query.toLowerCase())) {
        const index = doc.content.toLowerCase().indexOf(query.toLowerCase())
        const start = Math.max(0, index - 100)
        const end = Math.min(doc.content.length, index + query.length + 100)
        contentSnippet = (start > 0 ? '...' : '') + 
                         doc.content.substring(start, end) + 
                         (end < doc.content.length ? '...' : '')
      }
      
      return {
        ...doc,
        contentSnippet,
      }
    })
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching documents:', error)
    return NextResponse.json(
      { error: 'Failed to search documents' },
      { status: 500 }
    )
  }
}