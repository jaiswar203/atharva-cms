"use client"

import React, { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { Upload, FileImage, AlertCircle } from "lucide-react"
import { Input } from "./input"

interface DragDropUploadProps {
  onFilesDrop: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  className?: string
  disabled?: boolean
  children?: React.ReactNode
}

export function DragDropUpload({
  onFilesDrop,
  accept = "image/*",
  multiple = false,
  maxSize = 10, // Default 10MB
  className,
  disabled = false,
  children,
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const validateFiles = useCallback((files: File[]) => {
    setError(null)
    
    if (!files.length) return []

    // Check file types
    if (accept !== "*") {
      const acceptedTypes = accept.split(",").map(type => type.trim())
      const invalidFiles = files.filter(file => {
        return !acceptedTypes.some(type => {
          if (type.endsWith("/*")) {
            const mainType = type.split("/")[0]
            return file.type.startsWith(mainType)
          }
          return file.type === type || type === "*/*"
        })
      })
      
      if (invalidFiles.length > 0) {
        setError(`Invalid file type. Accepted: ${accept}`)
        return []
      }
    }

    // Check file sizes
    const tooBigFiles = files.filter(file => file.size > maxSize * 1024 * 1024)
    if (tooBigFiles.length > 0) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return []
    }

    return files
  }, [accept, maxSize])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    const filesToUpload = multiple ? droppedFiles : droppedFiles.slice(0, 1)
    
    const validFiles = validateFiles(filesToUpload)
    if (validFiles.length) {
      onFilesDrop(validFiles)
    }
  }, [onFilesDrop, multiple, validateFiles, disabled])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || disabled) return
    
    const selectedFiles = Array.from(e.target.files)
    const validFiles = validateFiles(selectedFiles)
    
    if (validFiles.length) {
      onFilesDrop(validFiles)
    }
    
    // Reset the input value to allow uploading the same file again
    e.target.value = ""
  }, [onFilesDrop, validateFiles, disabled])

  return (
    <div className="relative">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging ? "border-primary bg-muted/50" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {children || (
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-3 rounded-full bg-muted">
              {isDragging ? (
                <FileImage className="h-6 w-6 text-primary" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {isDragging ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {multiple ? "Upload multiple files" : "Upload one file"} up to {maxSize}MB
            </p>
          </div>
        )}
        <Input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
} 