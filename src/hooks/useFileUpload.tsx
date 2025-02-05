import { useState } from 'react'
import { toast } from "./use-toast"
import { useUploadFileMutation, useGetSignedUrlMutation } from '@/redux/api/college'

interface FileUploadReturn {
    uploading: boolean
    uploadFile: (file: File, showToast?: boolean) => Promise<string | undefined>
    getSignedUrl: (fileKey: string) => Promise<string | undefined>
}

export function useFileUpload(): FileUploadReturn {
    const [uploading, setUploading] = useState(false)
    const [uploadFileApi] = useUploadFileMutation()
    const [getSignedUrlApi] = useGetSignedUrlMutation()

    const uploadFile = async (file: File, showToast: boolean = true): Promise<string | undefined> => {
        setUploading(true)
        try {
            const response = await uploadFileApi(file).unwrap()

            if (showToast) {
                toast({
                    variant: "default",
                    title: "File Upload Successful",
                    description: `The file ${file.name} has been uploaded successfully.`,
                })
            }

            return response.data
        } catch (error) {
            console.log(error)
            toast({
                variant: "destructive",
                title: "File Upload Failed",
                description: `The file ${file.name} could not be uploaded. Please try again.`,
            })

            return undefined
        } finally {
            setUploading(false)
        }
    }

    const getSignedUrl = async (fileKey: string): Promise<string | undefined> => {
        try {
            const response = await getSignedUrlApi(fileKey).unwrap()
            return response.data
        } catch (error) {
            console.error('Failed to get signed URL:', error)
            return undefined
        }
    }

    return {
        uploading,
        uploadFile,
        getSignedUrl,
    }
}