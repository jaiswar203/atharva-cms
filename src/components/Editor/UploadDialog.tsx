'use client'

import { ChangeEvent, useState } from 'react'
import { useFileUpload } from '@/hooks/useFileUpload'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ImagePlus, Loader2 } from 'lucide-react'

interface UploadDialogProps {
  onUploadComplete?: (url: string) => void
  trigger?: React.ReactNode
}

export function UploadDialog({ onUploadComplete, trigger }: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { uploading, uploadFile } = useFileUpload()
  const [open, setOpen] = useState(false)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    const fileUrl = await uploadFile(selectedFile)
    if (fileUrl) {
      onUploadComplete?.(fileUrl)
      setSelectedFile(null)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ImagePlus className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Choose a file to upload. Supported formats: PNG, JPG, JPEG, GIF
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 