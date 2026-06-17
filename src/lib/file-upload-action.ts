'use server'

import { put } from '@vercel/blob'

export interface UploadedFileInfo {
  name: string
  url: string
  size: number
  contentType: string
}

export async function uploadPrescriptionAttachmentAction(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) throw new Error('File missing from form payload data.')

    // Store within an isolated folder partition inside your Vercel cloud storage bucket
    const blob = await put(
      `prescriptions/attachments/${Date.now()}-${file.name}`,
      file,
      {
        access: 'public',
        token: `VERCEL_OIDC_TOKEN`,
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
