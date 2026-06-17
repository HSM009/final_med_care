'use client'

import * as React from 'react'
import {
  useDropzone,
  type DropzoneOptions,
  type FileRejection,
} from 'react-dropzone'
import {
  X,
  UploadCloud,
  FileText,
  AlertCircle,
  Plus,
  Loader2,
} from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: File[]
  onValueChange?: (files: File[]) => void
  dropzoneOptions?: DropzoneOptions
  progress?: number
}

export function FileUploader({
  value = [],
  onValueChange,
  dropzoneOptions,
  progress,
  className,
  ...props
}: FileUploaderProps) {
  const [rejectedFiles, setRejectedFiles] = React.useState<FileRejection[]>([])
  const [isCompressing, setIsCompressing] = React.useState(false)

  const maxFiles = dropzoneOptions?.maxFiles ?? Infinity

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejections: FileRejection[]) => {
      setRejectedFiles(rejections)
      if (!onValueChange) return

      setIsCompressing(true)

      // Compression Options
      const compressionOptions = {
        maxSizeMB: 1, // Compress target down to under 1MB
        maxWidthOrHeight: 1920, // Max dimensions
        useWebWorker: true,
      }

      try {
        const processedFiles = await Promise.all(
          acceptedFiles.map(async (file) => {
            // Only compress image types (JPEG, PNG, WebP)
            if (file.type.startsWith('image/')) {
              try {
                const compressedBlob = await imageCompression(
                  file,
                  compressionOptions,
                )
                // Convert Blob back into a standard File object to preserve names
                return new File([compressedBlob], file.name, {
                  type: file.type,
                })
              } catch (err) {
                console.error('Compression failed for:', file.name, err)
                return file // Fallback to original file if compression crashes
              }
            }
            return file // Return non-image files (like PDFs) completely untouched
          }),
        )

        const updatedFiles = [...value, ...processedFiles].slice(0, maxFiles)
        onValueChange(updatedFiles)
      } catch (error) {
        toast.error('Failed to process files.')
      } finally {
        setIsCompressing(false)
      }
    },
    [value, onValueChange, maxFiles],
  )

  // Extract 'open' programmatically to trigger the file picker via standard HTML buttons
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    ...dropzoneOptions,
    noClick: value.length > 0, // Disable clicking the container if file previews are visible
  })

  const removeFile = (index: number) => {
    if (!onValueChange) return
    const updated = [...value]
    updated.splice(index, 1)
    onValueChange(updated)
  }

  return (
    <div className={cn('grid gap-4 w-full', className)} {...props}>
      {/* 1. Drag & Drop Zone: Only visible if 0 files are currently staged */}
      {value.length === 0 && (
        <div
          {...getRootProps()}
          className={cn(
            'group relative grid place-items-center h-48 rounded-lg border-2 border-dashed border-muted-foreground/20 px-5 py-2.5 text-center transition hover:bg-accent/50 cursor-pointer',
            isDragActive && 'border-primary bg-accent',
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="rounded-full border border-dashed p-3 bg-background group-hover:scale-110 transition-transform">
              {isCompressing ? (
                <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
              ) : (
                <UploadCloud className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">
                {isCompressing
                  ? 'Optimizing files...'
                  : isDragActive
                    ? 'Drop files here'
                    : 'Drag & drop files here, or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground">
                Max {maxFiles} {maxFiles === 1 ? 'file' : 'files'} allowed
                (Images automatically compressed)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. File Preview List */}
      {value.length > 0 && (
        <div className="grid gap-2 max-h-60 overflow-y-auto pr-1">
          {/* Invisible file input wrapper bound to useDropzone programmatics */}
          <input {...getInputProps()} />

          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-4 rounded-md border p-3 bg-background text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-9 w-9 rounded object-cover shrink-0 border"
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate text-foreground">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* 3. ✅ Compact "Add File" button: Appears if files exist but we haven't hit the cap */}
          {value.length < maxFiles ? (
            <Button
              type="button"
              size="sm"
              disabled={isCompressing}
              className="mt-1 w-full border-dashed cursor-pointer bg-green-600 text-white hover:text-green-200 hover:bg-green-600/40"
              onClick={open}
            >
              {isCompressing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4 " />
                  Add another file ({value.length}/{maxFiles})
                </>
              )}
            </Button>
          ) : (
            <div className=" p-2 text-center mt-1 w-full rounded-sm cursor-pointer bg-blue-600/40 text-white  ">
              Max file limit reached ({value.length}/{maxFiles})
            </div>
          )}
        </div>
      )}

      {/* Upload Progress Tracker */}
      {progress !== undefined && progress > 0 && progress < 100 && (
        <Progress value={progress} className="h-1.5 w-full" />
      )}

      {/* Error Output */}
      {rejectedFiles.length > 0 && (
        <div className="space-y-1 text-xs text-destructive bg-destructive/10 p-3 rounded-md">
          {rejectedFiles.map(({ file, errors }) => (
            <div key={file.name} className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">{file.name}:</span>{' '}
                {errors.map((e) => e.message).join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
