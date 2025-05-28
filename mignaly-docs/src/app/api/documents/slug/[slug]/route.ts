import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/documents/slug/[slug] - Get a document by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const document = await prisma.document.findUnique({
      where: {
        slug: params.slug,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        tags: true,
        versions: {
          orderBy: {
            versionNumber: 'desc',
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Get previous and next documents for navigation
    const prevDocument = await prisma.document.findFirst({
      where: {
        published: true,
        slug: {
          lt: params.slug,
        },
      },
      orderBy: {
        slug: 'desc',
      },
      select: {
        title: true,
        slug: true,
      },
    })
    
    const nextDocument = await prisma.document.findFirst({
      where: {
        published: true,
        slug: {
          gt: params.slug,
        },
      },
      orderBy: {
        slug: 'asc',
      },
      select: {
        title: true,
        slug: true,
      },
    })
    
    return NextResponse.json({
      ...document,
      prevDoc: prevDocument,
      nextDoc: nextDocument,
    })
  } catch (error) {
    console.error('Error fetching document by slug:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}