import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// GET /api/documents - Get all documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const categoryId = searchParams.get('categoryId')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    
    const where: any = {}
    
    if (published === 'true') {
      where.published = true
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    const documents = await prisma.document.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
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
      },
      ...(limit && { take: limit }),
    })
    
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

// POST /api/documents - Create a new document
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const data = await request.json()
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Create the document
    const document = await prisma.document.create({
      data: {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle,
        content: data.content,
        published: data.published || false,
        authorId: user.id,
        ...(data.categoryId && {
          category: {
            connect: {
              id: data.categoryId,
            },
          },
        }),
        ...(data.tagIds && data.tagIds.length > 0 && {
          tags: {
            connect: data.tagIds.map((id: string) => ({ id })),
          },
        }),
      },
    })
    
    // Create the initial document version
    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        versionNumber: 1,
        title: document.title,
        subtitle: document.subtitle || '',
        content: document.content,
      },
    })
    
    revalidatePath('/docs')
    revalidatePath('/dashboard')
    
    return NextResponse.json(document)
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}