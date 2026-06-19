import { downloadSchema } from '#/schemas/auth'
import { createServerFn } from '@tanstack/react-start'
import { put, get } from '@vercel/blob'

export interface UploadedFileInfo {
  name: string
  url: string
  size: number
  contentType: string
}

export const uploadPrescriptionAttachmentAction = createServerFn({
  method: 'POST',
})
  .validator((data: FormData) => data) // Validates that FormData is crossing the network boundary
  .handler(async ({ data }) => {
    try {
      const file = data.get('file') as File
      if (!file) throw new Error('File missing from form payload data.')

      const blob = await put(
        `prescriptions/attachments/${Date.now()}-${file.name}`,
        file,
        {
          access: 'private', // Using public unless you have a premium signed-url setup
        },
      )

      return {
        success: true,
        fileInfo: {
          name: file.name,
          url: blob.url,
          size: file.size,
          contentType: file.type,
        } as UploadedFileInfo,
      }
    } catch (error: any) {
      console.error('Vercel Blob transmission error:', error)
      return {
        success: false,
        error: error.message || 'Failed to execute asset save.',
      }
    }
  })

export const getDownloadUrl = createServerFn({ method: 'GET' })
  .validator(downloadSchema)
  .middleware([])
  .handler(async ({ data }) => {
    try {
      let cleanUrl = data.fileUrl
      if (cleanUrl.includes('%25')) {
        cleanUrl = decodeURIComponent(cleanUrl)
      }
      const blobResult = await get(cleanUrl, {
        access: 'private',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })

      if (!blobResult) {
        return new Response('File not found', { status: 404 })
      }
      const filename = blobResult.blob.pathname.split('/').pop() || 'download'
      return new Response(blobResult.stream as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type':
            blobResult.blob.contentType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } catch (error) {
      console.error('Vercel Blob pipeline failure:', error)
      return new Response('File not found or inaccessible', { status: 404 })
    }
  })

//---
