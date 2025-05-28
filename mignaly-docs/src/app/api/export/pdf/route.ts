import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Readable } from 'stream'
import * as puppeteer from 'puppeteer'

// POST /api/export/pdf - Export a document as PDF
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    // Get the document
    const document = await prisma.document.findUnique({
      where: {
        id: data.documentId,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        category: true,
      },
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Generate HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${document.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          h2 {
            font-size: 24px;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          h3 {
            font-size: 20px;
            margin-top: 25px;
            margin-bottom: 10px;
          }
          p {
            margin-bottom: 15px;
          }
          .subtitle {
            font-size: 18px;
            color: #666;
            margin-bottom: 30px;
          }
          .metadata {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
          }
          code {
            background-color: #f5f5f5;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: monospace;
          }
          pre {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            font-family: monospace;
          }
          blockquote {
            border-left: 4px solid #ddd;
            padding-left: 15px;
            color: #666;
            margin-left: 0;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>${document.title}</h1>
        ${document.subtitle ? `<div class="subtitle">${document.subtitle}</div>` : ''}
        
        <div class="metadata">
          <div>Author: ${document.author.name}</div>
          <div>Category: ${document.category ? document.category.name : 'Uncategorized'}</div>
          <div>Last Updated: ${new Date(document.updatedAt).toLocaleDateString()}</div>
        </div>
        
        <div class="content">
          ${document.content}
        </div>
        
        <div class="footer">
          Generated from Mignaly Documentation Platform
          <br>
          © ${new Date().getFullYear()} Mignaly, Inc. All rights reserved.
        </div>
      </body>
      </html>
    `
    
    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    })
    
    await browser.close()
    
    // Create a readable stream from the PDF buffer
    const stream = new Readable()
    stream.push(pdfBuffer)
    stream.push(null)
    
    // Return the PDF as a downloadable file
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${document.slug}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error exporting PDF:', error)
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    )
  }
}