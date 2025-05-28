import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// GET /api/documents/[id] - Get a document by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await prisma.document.findUnique({
      where: {
        id: params.id,
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
      },
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}

// PUT /api/documents/[id] - Update a document
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const data = await request.json()
    
    // Get the document to check ownership or admin status
    const document = await prisma.document.findUnique({
      where: {
        id: params.id,
      },
      include: {
        author: true,
      },
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
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
    
    // Check if the user is the author or an admin
    if (document.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Get the current version number
    const latestVersion = await prisma.documentVersion.findFirst({
      where: {
        documentId: params.id,
      },
      orderBy: {
        versionNumber: 'desc',
      },
    })
    
    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1
    
    // Create a new document version
    await prisma.documentVersion.create({
      data: {
        documentId: params.id,
        versionNumber: newVersionNumber,
        title: data.title,
        subtitle: data.subtitle || '',
        content: data.content,
      },
    })
    
    // Update the document
    const updatedDocument = await prisma.document.update({
      where: {
        id: params.id,
      },
      data: {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle,
        content: data.content,
        published: data.published,
        version: newVersionNumber,
        ...(data.categoryId && {
          category: {
            connect: {
              id: data.categoryId,
            },
          },
        }),
        ...(data.categoryId === null && {
          category: {
            disconnect: true,
          },
        }),
        ...(data.tagIds && {
          tags: {
            set: data.tagIds.map((id: string) => ({ id })),
          },
        }),
      },
    })
    
    revalidatePath('/docs')
    revalidatePath(`/docs/${data.slug}`)
    revalidatePath('/dashboard')
    
    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    )
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get the document to check ownership or admin status
    const document = await prisma.document.findUnique({
      where: {
        id: params.id,
      },
      include: {
        author: true,
      },
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
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
    
    // Check if the user is the author or an admin
    if (document.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Delete the document versions first
    await prisma.documentVersion.deleteMany({
      where: {
        documentId: params.id,
      },
    })
    
    // Delete the document
    await prisma.document.delete({
      where: {
        id: params.id,
      },
    })
    
    revalidatePath('/docs')
    revalidatePath('/dashboard')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}