import React, { useRef } from 'react'
import { useGetCollegesQuery, useAddNoticeMutation, useUpdateNoticeByIdMutation, ICollege } from '@/redux/api/college'
import { INotice } from '@/redux/api/college'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useFileUpload } from '@/hooks/useFileUpload'
import { toast } from '@/hooks/use-toast'
import { Paperclip, X, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import MDXEditor, { MDXEditorMethods } from '../Editor/MDXEditor'

// Form input type with string date
export type NoticeFormInputs = {
    title: string;
    description: string;
    date: string;
    attachments: Array<{ id: number; name: string; url: string; }>;
    link: string;
    college_id: string;
}

interface NoticeDetailProps {
    notice?: INotice & { college: ICollege }
    onClose: () => void
}

const NoticeDetail = ({ notice, onClose }: NoticeDetailProps) => {
    const { data: colleges } = useGetCollegesQuery()
    const [addNotice, { isLoading: isAdding }] = useAddNoticeMutation()
    const [updateNotice, { isLoading: isUpdating }] = useUpdateNoticeByIdMutation()
    const { uploadFile, uploading } = useFileUpload()
    const editorRef = useRef<MDXEditorMethods>(null)

    const form = useForm<NoticeFormInputs>({
        defaultValues: {
            title: notice?.title || '',
            description: notice?.description || '',
            date: notice?.date ? new Date(notice.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            attachments: notice?.attachments || [],
            link: notice?.link || '',
            college_id: notice?.college._id || ''
        }
    })

    const onSubmit = async (formData: NoticeFormInputs) => {
        try {
            // Get the markdown content from the editor
            const description = editorRef.current?.getMarkdown() || formData.description

            const submitData = {
                ...formData,
                description
            }

            if (notice?._id) {
                await updateNotice({ data: submitData, id: notice._id }).unwrap()
                toast({
                    title: "Success",
                    description: "Notice updated successfully",
                })
            } else {
                await addNotice(submitData).unwrap()
                toast({
                    title: "Success",
                    description: "Notice added successfully",
                })
            }
            onClose()
        } catch (error) {
            console.log(error)
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            })
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const currentAttachments = form.getValues('attachments') || []

        for (const file of files) {
            const url = await uploadFile(file)
            if (url) {
                const newAttachment = {
                    id: currentAttachments.length + 1,
                    name: file.name,
                    url
                }
                currentAttachments.push(newAttachment)
            }
        }

        form.setValue('attachments', currentAttachments, { shouldDirty: true })
    }

    const handleImageUpload = async (file: File): Promise<string> => {
        const url = await uploadFile(file)
        return url || ''
    }

    const removeAttachment = (id: number) => {
        const currentAttachments = form.getValues('attachments')
        const filteredAttachments = currentAttachments.filter(attachment => attachment.id !== id)
        form.setValue('attachments', filteredAttachments, { shouldDirty: true })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="college_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>College</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a college" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {colleges?.data.map((college) => (
                                        <SelectItem key={college._id} value={college._id} className=''>
                                            <div className="flex flex-row items-center gap-2">
                                                <Image src={college.logo} alt={college.name} width={20} height={20} />
                                                <p className='text-sm'>{college.name}</p>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter notice title" />
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
                                <MDXEditor
                                    ref={editorRef}
                                    markdown={field.value}
                                    onImageUpload={handleImageUpload}
                                    onChange={(value) => {
                                        field.onChange(value)
                                    }}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>External Link</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter external link" />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="attachments"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>Attachments</FormLabel>
                                {field.value?.length > 0 && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                                <span className="ml-2">View All</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {field.value.map((attachment) => (
                                                <DropdownMenuItem key={attachment.id} asChild>
                                                    <Link
                                                        href={attachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Paperclip className="h-4 w-4" />
                                                        {attachment.name}
                                                    </Link>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                            <FormControl>
                                <Input
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </FormControl>
                            <div className="space-y-2">
                                {field.value?.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                                        <Paperclip className="h-4 w-4" />
                                        <span className="text-sm flex-1">{attachment.name}</span>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeAttachment(attachment.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={{ isLoading: isAdding || isUpdating }}>
                        {notice ? 'Update' : 'Add'} Notice
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default NoticeDetail