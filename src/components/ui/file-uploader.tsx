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
  ImageIcon,
} from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { type UploadedFileInfo } from '#/lib/vercel-action' // Ensure correct import path

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: File[]
  onValueChange?: (files: File[]) => void
  uploadedFiles?: UploadedFileInfo[] // 🌐 Cloud files already saved
  onRemoveUploadedFile?: (index: number) => void // 🌐 Callback to delete a cloud file
  dropzoneOptions?: DropzoneOptions
}

export function FileUploader({
  value = [],
  onValueChange,
  uploadedFiles = [],
  onRemoveUploadedFile,
  dropzoneOptions,
  className,
  ...props
}: FileUploaderProps) {
  const [rejectedFiles, setRejectedFiles] = React.useState<FileRejection[]>([])
  const [isCompressing, setIsCompressing] = React.useState(false)

  const maxFiles = dropzoneOptions?.maxFiles ?? Infinity
  // Total count accounts for both freshly staged local files and remote stored assets
  const totalFileCount = value.length + uploadedFiles.length

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejections: FileRejection[]) => {
      setRejectedFiles(rejections)
      if (!onValueChange) return

      setIsCompressing(true)

      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      }

      try {
        const processedFiles = await Promise.all(
          acceptedFiles.map(async (file) => {
            if (file.type.startsWith('image/')) {
              try {
                const compressedBlob = await imageCompression(
                  file,
                  compressionOptions,
                )
                return new File([compressedBlob], file.name, {
                  type: file.type,
                })
              } catch (err) {
                console.error('Compression failed for:', file.name, err)
                return file
              }
            }
            return file
          }),
        )

        const remainingQuota = maxFiles - uploadedFiles.length
        const updatedFiles = [...value, ...processedFiles].slice(
          0,
          remainingQuota,
        )
        onValueChange(updatedFiles)
      } catch (error) {
        toast.error('Failed to process files.')
      } finally {
        setIsCompressing(false)
      }
    },
    [value, onValueChange, maxFiles, uploadedFiles.length],
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    ...dropzoneOptions,
    maxFiles: maxFiles - uploadedFiles.length,
    noClick: totalFileCount > 0,
  })

  const removeLocalFile = (index: number) => {
    if (!onValueChange) return
    const updated = [...value]
    updated.splice(index, 1)
    onValueChange(updated)
  }

  return (
    <div className={cn('grid gap-4 w-full', className)} {...props}>
      {/* 1. Drag & Drop Target Area */}
      {totalFileCount === 0 && (
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
                Max {maxFiles} files allowed (Images automatically compressed)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Unified Preview Registry */}
      {totalFileCount > 0 && (
        <div className="grid gap-2 max-h-60 overflow-y-auto pr-1">
          <input {...getInputProps()} />

          {/* Render files already saved in Vercel Blob */}
          {uploadedFiles.map((file, index) => (
            <div
              key={file.url}
              className="flex items-center justify-between gap-4 rounded-md border border-green-500/30 p-3 bg-green-500/5 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                {file.contentType?.startsWith('image/') ||
                file.name.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <ImageIcon
                    // src={file.url}
                    // alt={file.name}
                    className="h-9 w-9 rounded object-cover shrink-0 border"
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate text-foreground flex items-center gap-1.5">
                    {file.name}
                    <span className="text-[10px] bg-green-600/20 text-green-400 px-1.5 py-0.5 rounded-full font-normal">
                      Saved
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Remote Network Node
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => onRemoveUploadedFile?.(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Render new local files waiting for save */}
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
                onClick={() => removeLocalFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* 3. Add file option if total size is below maximum limit */}
          {totalFileCount < maxFiles ? (
            <Button
              type="button"
              size="sm"
              disabled={isCompressing}
              className="mt-1 w-full border-dashed cursor-pointer bg-green-600 text-white hover:bg-green-700"
              onClick={open}
            >
              {isCompressing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Add another file (
                  {totalFileCount}/{maxFiles})
                </>
              )}
            </Button>
          ) : (
            <div className="p-2 text-center mt-1 w-full rounded-sm bg-blue-600/40 text-white text-xs font-medium">
              Max file limit reached ({totalFileCount}/{maxFiles})
            </div>
          )}
        </div>
      )}

      {/* Rejection Errors */}
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
