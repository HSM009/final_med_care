// src/actions/upload.ts
import { createServerFn } from '@tanstack/react-start'
import { put } from '@vercel/blob'

export interface UploadedFileInfo {
  name: string
  url: string
  size: number
  contentType: string
}

// 🌐 Convert to an explicit TanStack Server Function
export const uploadPrescriptionAttachmentAction = createServerFn({
  method: 'POST',
})
  .validator((data: FormData) => data) // Validates that FormData is crossing the network boundary
  .handler(async ({ data }) => {
    try {
      const file = data.get('file') as File
      if (!file) throw new Error('File missing from form payload data.')

      // 🔍 Since this now executes safely on the backend server,
      // this line will print your actual environment variable token!
      console.log(
        'TOKEN CHECK:',
        process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 10) + '...',
      )

      const blob = await put(
        `prescriptions/attachments/${Date.now()}-${file.name}`,
        file,
        {
          access: 'public', // Using public unless you have a premium signed-url setup
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
