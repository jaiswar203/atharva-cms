'use client'
import React, { useState, useEffect } from 'react'
import { useGetCollegesQuery, useCreateHighlightMutation, useUpdateHighlightMutation, useAddSectionToHighlightMutation } from '@/redux/api/college'
import { IHighlight } from '@/redux/api/college'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useFileUpload } from '@/hooks/useFileUpload'
import { toast } from '@/hooks/use-toast'
import { X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { SingleSection } from '../Section'
import Typography from '../ui/typography'

export type HighlightFormInputs = {
    title: string;
    description: string;
    banner_image: string;
    carousel_images: string[];
    college_id: string;
    section_id?: string;
}

interface HighlightDetailProps {
    highlight?: IHighlight
    onClose: () => void
}

const HighlightDetail = ({ highlight, onClose }: HighlightDetailProps) => {
    const { data: colleges } = useGetCollegesQuery()
    const [createHighlight, { isLoading: isCreating }] = useCreateHighlightMutation()
    const [updateHighlight, { isLoading: isUpdating }] = useUpdateHighlightMutation()
    const [addSectionToHighlight, { isLoading: isAddingSection }] = useAddSectionToHighlightMutation()
    const { uploadFile, uploading } = useFileUpload()
    const [selectedCollege, setSelectedCollege] = useState<string>(highlight?.college?._id || '')
    const [createdHighlightId, setCreatedHighlightId] = useState<string>(highlight?._id || '')
    const [selectedSectionId, setSelectedSectionId] = useState<string>(highlight?.section?._id || '')

    const form = useForm<HighlightFormInputs>({
        defaultValues: {
            title: highlight?.title || '',
            description: highlight?.description || '',
            banner_image: highlight?.banner_image || '',
            carousel_images: highlight?.carousel_images || [],
            college_id: highlight?.college?._id || '',
            section_id: highlight?.section?._id || '',
        }
    })

    // Update form values when highlight data changes
    useEffect(() => {
        if (highlight) {
            form.setValue('title', highlight.title)
            form.setValue('description', highlight.description)
            form.setValue('banner_image', highlight.banner_image)
            form.setValue('carousel_images', highlight.carousel_images || [])
            form.setValue('college_id', highlight.college?._id || '')
            form.setValue('section_id', highlight.section?._id || '')

            setSelectedCollege(highlight.college?._id || '')
            setSelectedSectionId(highlight.section?._id || '')
            setCreatedHighlightId(highlight._id)
        }
    }, [highlight, form])

    const onSubmit = async (formData: HighlightFormInputs) => {
        try {
            const submitData = {
                ...formData,
                carousel_images: formData.carousel_images || []
            }

            if (highlight?._id) {
                await updateHighlight({ id: highlight._id, data: submitData }).unwrap()
                toast({
                    title: "Success",
                    description: "Highlight updated successfully",
                })
                setCreatedHighlightId(highlight._id)
            } else {
                // Destructure section_id out as we don't want to send it to the API
                /* eslint-disable @typescript-eslint/no-unused-vars */
                const { section_id: _, ...rest } = submitData
                const result = await createHighlight(rest).unwrap()
                if (result.data?._id) {
                    setCreatedHighlightId(result.data._id)
                    toast({
                        title: "Success",
                        description: "Highlight added successfully. You can now manage its section below.",
                    })
                }
            }
        } catch (error) {
            console.log(error)
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive"
            })
        }
    }

    const handleCreateSection = async () => {
        if (!createdHighlightId || !selectedCollege) {
            toast({
                title: "Error",
                description: "Please save the highlight and select a college first",
                variant: "destructive"
            })
            return
        }

        try {
            const result = await addSectionToHighlight({
                collegeId: selectedCollege,
                highlightId: createdHighlightId,
                data: { name: `${form.getValues('title')} Section` }
            }).unwrap()

            if (result.data?._id) {
                setSelectedSectionId(result.data._id)
                form.setValue('section_id', result.data._id)

                toast({
                    title: "Success",
                    description: "Section created successfully. You can now edit its content.",
                })
            }
        } catch (error) {
            console.log(error)
            toast({
                title: "Error",
                description: "Failed to create section",
                variant: "destructive"
            })
        }
    }

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const url = await uploadFile(file)
        if (url) {
            form.setValue('banner_image', url)
        }
    }

    const handleCarouselImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const currentImages = form.getValues('carousel_images') || []

        for (const file of files) {
            const url = await uploadFile(file)
            if (url) {
                currentImages.push(url)
            }
        }

        form.setValue('carousel_images', currentImages)
    }

    const removeImage = (index: number) => {
        const currentImages = form.getValues('carousel_images')
        const filteredImages = currentImages.filter((_: string, i: number) => i !== index)
        form.setValue('carousel_images', filteredImages)
    }

    return (
        <div className="space-y-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="college_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>College</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value)
                                        setSelectedCollege(value)
                                        // Reset section_id when college changes
                                        if (value !== field.value) {
                                            form.setValue('section_id', '')
                                            setSelectedSectionId('')
                                        }
                                    }}
                                    value={field.value}
                                >
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
                                    <Input {...field} placeholder="Enter highlight title" />
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
                                    <Input {...field} placeholder="Enter highlight description" />
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
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBannerUpload}
                                        disabled={uploading}
                                    />
                                </FormControl>
                                {field.value && (
                                    <div className="relative w-full flex justify-center mb-2">
                                        <Image
                                            src={field.value}
                                            alt="Banner"
                                            width={400}
                                            height={200}
                                            className="object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="carousel_images"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Carousel Images</FormLabel>
                                <div className="grid grid-cols-3 gap-4 mb-2">
                                    {field.value?.map((image, index) => (
                                        <div key={index} className="relative">
                                            <Image
                                                src={image}
                                                alt={`Carousel ${index + 1}`}
                                                width={400}
                                                height={200}
                                                className="object-cover rounded-lg"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6"
                                                onClick={() => removeImage(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <FormControl>
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleCarouselImagesUpload}
                                        disabled={uploading}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating || isUpdating}>
                            {isCreating || isUpdating ? (
                                <>Saving...</>
                            ) : (
                                <>{highlight ? 'Update' : 'Create'} Highlight</>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>

            {selectedCollege && (
                <div className="mt-8 border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4">Highlight Section</h2>
                    <Typography variant="p" className="text-sm text-gray-500 mb-4">
                        This section will be displayed on the highlight page. You can edit its content below.
                    </Typography>

                    {(createdHighlightId || highlight?._id) && selectedSectionId ? (
                        <SingleSection
                            sectionId={selectedSectionId}
                            collegeId={selectedCollege}
                            entityType="highlight"
                            tabId={createdHighlightId} // Required by the API
                        />
                    ) : (
                        <div className="bg-gray-100 p-4 rounded-md">
                            <Typography variant="p" className="text-center mb-4">
                                {!createdHighlightId && !highlight?._id
                                    ? "Save the highlight first to manage its section"
                                    : "No section associated with this highlight yet. Create one by clicking the button below."}
                            </Typography>
                            {(createdHighlightId || highlight?._id) && (
                                <Button
                                    className="w-full"
                                    onClick={handleCreateSection}
                                    disabled={isAddingSection}
                                >
                                    {isAddingSection ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Section...
                                        </>
                                    ) : (
                                        "Create Section"
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default HighlightDetail 