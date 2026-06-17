import { createServerFn } from '@tanstack/react-start'
import { put } from '@vercel/blob'

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
          token: 'BLOB_READ_WRITE_TOKEN',
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

//---
