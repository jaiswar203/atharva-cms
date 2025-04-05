"use client"
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { useCreateCollegeMutation } from '@/redux/api/college'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { useFileUpload } from '@/hooks/useFileUpload'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface CreateCollegeFormInputs {
  name: string;
  description: string;
  logo: string;
  banner_image: string;
}

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCollegeModal = ({ open, onOpenChange }: IProps) => {
  const router = useRouter()
  const { uploadFile, uploading } = useFileUpload()
  const [createCollege, { isLoading }] = useCreateCollegeMutation()

  const form = useForm<CreateCollegeFormInputs>({
    defaultValues: {
      name: '',
      description: '',
      logo: '',
      banner_image: ''
    }
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof CreateCollegeFormInputs) => {
    const files = e.target.files
    if (!files || !files[0]) return

    const url = await uploadFile(files[0])
    if (url) {
      form.setValue(fieldName, url, { shouldDirty: true })
    }
  }

  const onSubmit = async (data: CreateCollegeFormInputs) => {
    try {
      if (!data.name || !data.description || !data.logo || !data.banner_image) {
        toast({
          title: "Error",
          description: "All fields are required",
          variant: "destructive"
        })
        return
      }

      const response = await createCollege(data).unwrap()

      if (response.data) {
        toast({
          title: "Success",
          description: "College created successfully",
          variant: "default"
        })
        onOpenChange(false)
        router.push(`/colleges/${response.data._id}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create college",
        variant: "destructive"
      })
      console.error("Create college error:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New College</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>College Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter college name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter college description" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'logo')}
                        disabled={uploading}
                      />
                      {field.value && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                          <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                            <Image
                              src={field.value}
                              alt="Logo preview"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="banner_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner Image</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'banner_image')}
                        disabled={uploading}
                      />
                      {field.value && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                          <div className="relative w-full h-40 border rounded-md overflow-hidden">
                            <Image
                              src={field.value}
                              alt="Banner preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={{ isLoading: isLoading || uploading }}>
                Create College
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateCollegeModal 