'use server'

import { put } from '@vercel/blob'

export interface UploadedFileInfo {
  name: string
  url: string
  size: number
  contentType: string
}

export async function uploadPrescriptionAttachmentAction(formData: FormData) {
  const getEnvKey = import.meta.env.BLOB_READ_WRITE_TOKEN
  try {
    const file = formData.get('file') as File
    if (!file) throw new Error('File missing from form payload data.')

    // Store within an isolated folder partition inside your Vercel cloud storage bucket
    const blob = await put(
      `store-attachments-med-care/prescriptions/attachments/${Date.now()}-${file.name},file`,
      file,
      {
        access: 'private',
        token: `BLOB_READ_WRITE_TOKEN`,
        oidcToken: getEnvKey,
        // storeId: process.env.BLOB_STORE_ID,
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
}
