"use client"

import { useState } from "react"
import { DragDropUpload } from "@/components/ui/drag-drop-upload"
import { Button } from "@/components/ui/button"
import { X, Image as ImageIcon, Plus } from "lucide-react"
import Image from "next/image"

interface ImageUploaderProps {
  onImageUpload: (file: File) => Promise<string>
  onImageRemove?: (url: string) => void
  images?: string[]
  maxImages?: number
  accept?: string
  maxSize?: number
  title?: string
  description?: string
  className?: string
  disabled?: boolean
}

export function ImageUploader({
  onImageUpload,
  onImageRemove,
  images = [],
  maxImages = 10,
  accept = "image/*",
  maxSize = 5,
  title = "Upload Images",
  description = "Drag and drop images or click to browse",
  className,
  disabled = false,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFilesDrop = async (files: File[]) => {
    if (images.length >= maxImages) {
      setUploadError(`Maximum of ${maxImages} images allowed`)
      return
    }

    // Limit the number of files to upload based on maxImages
    const filesToUpload = files.slice(0, maxImages - images.length)
    
    setIsUploading(true)
    setUploadError(null)
    
    try {
      for (const file of filesToUpload) {
        await onImageUpload(file)
      }
    } catch (error) {
      setUploadError("Failed to upload image")
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (url: string) => {
    if (onImageRemove) {
      onImageRemove(url)
    }
  }

  const handleManualFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || disabled) return
    
    const files = Array.from(e.target.files)
    await handleFilesDrop(files)
    
    // Reset the input value to allow uploading the same file again
    e.target.value = ""
  }

  return (
    <div className={className}>
      {images.length < maxImages && (
        <DragDropUpload
          onFilesDrop={handleFilesDrop}
          accept={accept}
          multiple={maxImages - images.length > 1}
          maxSize={maxSize}
          disabled={disabled || isUploading}
        >
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <div className="p-3 rounded-full bg-muted">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {images.length > 0 
                  ? `${images.length} of ${maxImages} images uploaded`
                  : `Upload up to ${maxImages} images`
                }
              </p>
            </div>
            {isUploading && <p className="text-sm text-primary">Uploading...</p>}
            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
          </div>
        </DragDropUpload>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="relative aspect-square rounded-md overflow-hidden border">
              <Image 
                src={url} 
                alt={`Uploaded image ${index + 1}`} 
                fill 
                className="object-cover"
              />
              {!disabled && onImageRemove && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => handleRemoveImage(url)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          {images.length < maxImages && !disabled && (
            <>
              <button 
                className="flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-md aspect-square hover:border-primary/50 hover:bg-muted/50 transition-colors"
                onClick={() => document.getElementById("hidden-file-input")?.click()}
                disabled={disabled}
              >
                <Plus className="h-6 w-6 text-muted-foreground" />
              </button>
              <input
                id="hidden-file-input"
                type="file"
                className="hidden"
                accept={accept}
                multiple={maxImages - images.length > 1}
                disabled={disabled || isUploading}
                onChange={handleManualFileSelect}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
} 