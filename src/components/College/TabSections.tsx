import React, { useEffect, useState } from 'react'
import { ISection, ITable, useAddSectionToTabMutation, useDeleteSectionByIdMutation, useGetSectionsByTabIdQuery, useUpdateSectionByIdMutation } from '@/redux/api/college'
import { Button } from '../ui/button'
import { Edit, Plus, Check, X, ImageIcon, VideoIcon, GalleryHorizontal, Users, Table, FileIcon } from 'lucide-react'
import Typography from '../ui/typography'
import { DYNAMIC_VARIABLES_TYPES, MEDIA_POSITION } from '@/types/college'
import { MDXEditor } from '../Editor/MDXEditor'
import { useFieldArray, useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { useFileUpload } from '@/hooks/useFileUpload'
import MarkdownRenderer from '../Editor/MarkdownRenderer'
import { MobilePreview } from '../Preview/Preview'
import { toast } from '@/hooks/use-toast'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog'
import SectionRenderer from '../Preview/SectionRenderer'

interface IProps {
    tabId: string
    collegeId: string
}

interface IImage {
    url: string
    description: string
}

interface IPDF {
    url: string
    name: string
    description: string
}
interface IDynamicVariable {
    key?: string
    type: DYNAMIC_VARIABLES_TYPES
    media_id: string
}

export type ISectionFormInput = ISection<string, string>


const TabSections = ({ tabId, collegeId }: IProps) => {
    const [selectedSection, setSelectedSection] = useState<ISection | null>(null)
    const { uploadFile } = useFileUpload()
    const [isEditing, setIsEditing] = useState(false)

    const [modal, setModal] = useState<{
        dynamicVariable?: boolean;
        video?: boolean;
        carousel?: boolean;
        peopleCard?: boolean;
        newSection?: boolean;
        table?: boolean;
        deleteSection?: boolean;
        pdf?: boolean;
    }>({
        dynamicVariable: false,
        video: false,
        carousel: false,
        peopleCard: false,
        newSection: false,
        deleteSection: false,
        table: false,
        pdf: false,
    });

    const { data } = useGetSectionsByTabIdQuery(tabId)
    const [updateSectionByIdApi, { isLoading: isUpdating }] = useUpdateSectionByIdMutation()
    const [addSectionToTabApi, { isLoading: isAdding }] = useAddSectionToTabMutation()
    const [deleteSectionByIdApi, { isLoading: isDeleting }] = useDeleteSectionByIdMutation()

    const [newSectionName, setNewSectionName] = useState('')

    const form = useForm<ISectionFormInput>({
        defaultValues: {
            name: '',
            content: '',
            hide_heading: false,
            media_position: {},
            images: [],
            has_media: {},
            pdfs: []
        },
    })

    const { fields: images, append: appendImage, remove: removeImage } = useFieldArray({
        control: form.control,
        name: 'images'
    })

    const { fields: pdfs, append: appendPdf, remove: removePdf } = useFieldArray({
        control: form.control,
        name: 'pdfs'
    })

    useEffect(() => {
        if (!selectedSection) {
            if (data?.data?.length) {
                setSelectedSection(data.data[0])
            }
        }
    }, [data])

    useEffect(() => {
        if (selectedSection) {
            const mediaPosition = {
                image: selectedSection.media_position?.image as MEDIA_POSITION | undefined,
                carousel: selectedSection.media_position?.carousel as MEDIA_POSITION | undefined,
                pdf: selectedSection.media_position?.pdf as MEDIA_POSITION | undefined,
                table: selectedSection.media_position?.table as MEDIA_POSITION | undefined,
                people_card: selectedSection.media_position?.people_card as MEDIA_POSITION | undefined,
                video: selectedSection.media_position?.video as MEDIA_POSITION | undefined,
            };

            form.reset({
                name: selectedSection.name,
                content: selectedSection.content,
                hide_heading: selectedSection.hide_heading,
                media_position: mediaPosition,
                images: selectedSection.images,
                has_media: selectedSection.has_media,
                pdfs: selectedSection.pdfs,
            })
        }
    }, [selectedSection])

    const handleImageUpload = async (file: File): Promise<string> => {
        const url = await uploadFile(file)
        if (!url) {
            throw new Error('Failed to upload image')
        }
        return url
    }

    const onUpdate = async (data: ISectionFormInput) => {
        if (!selectedSection?._id) {
            toast({
                title: 'Section not found',
                description: 'Section not found',
            })
            return
        }
        try {
            await updateSectionByIdApi({
                data,
                sectionId: selectedSection?._id,
                collegeId: collegeId,
            }).unwrap()
            setIsEditing(false)
            toast({
                title: 'Section updated successfully',
                description: 'Section updated successfully',
            })
        } catch (error) {
            console.log(error)
            toast({
                title: 'Failed to update section',
                description: 'Failed to update section',
            })
        }
    }

    const carouselType = form.watch('has_media.carousel')
    const carouselPosition = form.watch('media_position.carousel')
    const pdfPosition = form.watch('media_position.pdf')
    const formData = form.watch()


    const onAddSection = async () => {
        try {
            await addSectionToTabApi({
                data: { name: newSectionName },
                tabId: tabId,
                collegeId: collegeId,
            }).unwrap()

            toast({
                title: 'Section added successfully',
                description: 'Section added successfully',
            })
            setModal({ newSection: false })
            setNewSectionName('')
        } catch (error: any) {
            if (error.status === 400) {
                toast({
                    title: 'Section already exists',
                    description: 'Section already exists',
                })
            }
            console.log(error)
            toast({
                title: 'Failed to add section',
                description: 'Failed to add section',
            })
        }
    }

    const removeCarousel = () => {
        form.setValue('has_media.carousel', false, { shouldDirty: true });
        form.setValue('has_media.image', false, { shouldDirty: true });
        form.setValue('media_position.carousel', undefined, { shouldDirty: true });
        form.setValue('media_position.image', undefined, { shouldDirty: true });
        form.setValue('images', [], { shouldDirty: true });
    }

    const removePDFs = () => {
        form.setValue('has_media.pdf', false, { shouldDirty: true });
        form.setValue('media_position.pdf', undefined, { shouldDirty: true });
        form.setValue('pdfs', [], { shouldDirty: true });
    }

    return (
        <div>
            <div className="flex justify-between items-center">
                <Typography variant="h3" className=' font-semibold'>Sections</Typography>
                <Button onClick={() => setModal(prev => ({ ...prev, newSection: true }))}>
                    <Plus size={20} />
                    <span>Add Section</span>
                </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {
                    data?.data?.length ? data.data.map((section) => (
                        <div className={`flex justify-center items-center border-2 gap-8  p-2 max-w-72 w-fit rounded-lg cursor-pointer relative ${selectedSection?._id === section._id ? 'bg-gray-200' : ''}`} key={section._id} onClick={() => setSelectedSection(section)}>
                            <Typography variant="p" className=' text-sm text-gray-500'>{section.name}</Typography>
                            <Button variant="destructive" size="icon" className='absolute -top-6 -right-3 rounded-full' onClick={(e) => {
                                e.stopPropagation();
                                setModal(prev => ({ ...prev, deleteSection: true }))
                            }}>
                                <X size={15} />
                            </Button>
                            {
                                modal.deleteSection && (
                                    <Dialog open={modal.deleteSection} onOpenChange={() => setModal({ deleteSection: false })}>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Delete Section</DialogTitle>
                                            </DialogHeader>
                                            <DialogDescription>
                                                Are you sure you want to delete section <span className='font-semibold'>{section.name}</span>?
                                            </DialogDescription>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setModal({ deleteSection: false })}>
                                                    Cancel
                                                </Button>
                                                <Button variant="destructive" onClick={async () => {
                                                    await deleteSectionByIdApi({ collegeId, tabId, sectionId: section._id }).unwrap()
                                                    toast({
                                                        title: 'Section deleted successfully',
                                                        description: 'Section deleted successfully',
                                                    })
                                                    setModal({ deleteSection: false })
                                                }}>Delete</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )
                            }
                        </div>
                    )) : (
                        <div className='flex justify-center items-center h-full w-full'>
                            <Typography variant="p" className=' text-sm text-gray-500'>No sections found</Typography>
                        </div>
                    )
                }
            </div>
            <br />

            <div className="flex justify-between items-center">
                <Typography variant="h3" className='font-semibold'>{selectedSection?.name}</Typography>
                {
                    !isEditing ? (
                        <Button onClick={() => setIsEditing(true)} >
                            <Edit size={20} />
                            <span>Edit</span>
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                <X size={20} />
                                <span>Cancel</span>
                            </Button>
                            <Button onClick={form.handleSubmit(onUpdate)} disabled={!form.formState.isDirty || isUpdating} loading={{ isLoading: isUpdating }}>
                                <Check size={20} />
                                <span>Update</span>
                            </Button>
                        </div>
                    )
                }
            </div>

            {selectedSection && (
                <div className="mt-6">
                    <Form {...form}>
                        <form className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Section Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter section name"
                                                {...field}
                                                disabled={!isEditing}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-between gap-3">
                                <div className="w-full">
                                    <MobilePreview>
                                        <SectionRenderer section={{
                                            _id: selectedSection._id,
                                            name: formData.name,
                                            content: formData.content,
                                            has_media: formData.has_media || {},
                                            media_position: formData.media_position || {},
                                            hide_heading: formData.hide_heading || false,
                                            images: formData.images || [],
                                            tables: [],
                                            dynamic_variables: [],
                                            pdfs: formData.pdfs || []
                                        }} className="p-4 pt-8 bg-background rounded-lg border">
                                            <MarkdownRenderer
                                                content={formData.content || ''}
                                            />
                                        </SectionRenderer>
                                    </MobilePreview>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <div className="flex justify-between items-center">
                                                <FormLabel>Content</FormLabel>
                                                <Button variant="outline" type='button' onClick={() => setModal(prev => ({ ...prev, dynamicVariable: true }))} disabled={!isEditing}>
                                                    <Plus size={20} />
                                                    <span>Add Media</span>
                                                </Button>
                                            </div>
                                            <FormControl>
                                                <MDXEditor
                                                    markdown={field.value || ''}
                                                    onChange={(markdown) => {
                                                        field.onChange(markdown);
                                                    }}
                                                    editable={isEditing}
                                                    onImageUpload={handleImageUpload}
                                                    placeholder="Enter content here..."
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                {
                                    modal.carousel && (
                                        <Dialog open={modal.carousel} onOpenChange={() => setModal({ carousel: false })}>
                                            <DialogContent className='max-w-7xl'>
                                                <DialogHeader>
                                                    <DialogTitle></DialogTitle>
                                                </DialogHeader>
                                                <div className="relative">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <Typography variant="p" className='font-semibold'>Carousel Images</Typography>
                                                            {images.length > 0 && (
                                                                <Button variant="destructive" type='button' onClick={removeCarousel} disabled={!isEditing}>
                                                                    <X size={20} />
                                                                    <span>Remove Carousel</span>
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label htmlFor="carousel-image-input" className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer'>
                                                                <Plus size={20} />
                                                                <span>Add Images</span>
                                                            </label>
                                                            <input
                                                                type="file"
                                                                multiple
                                                                accept="image/*"
                                                                className="hidden"
                                                                id="carousel-image-input"
                                                                onChange={async (e) => {
                                                                    const files = e.target.files;
                                                                    if (files) {
                                                                        for (const file of Array.from(files)) {
                                                                            const url = await uploadFile(file);
                                                                            if (url) {
                                                                                appendImage({ url, description: '' });
                                                                            }
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="p-2">
                                                        <FormItem>Carousel Type</FormItem>
                                                        <div className="flex items-center gap-3">
                                                            <Button type='button' variant='outline' className={`${carouselType ? 'bg-primary text-white' : ''}`} onClick={() => {
                                                                form.setValue('has_media.carousel', true, { shouldDirty: true });
                                                                form.setValue('has_media.image', false, { shouldDirty: true });
                                                                form.setValue('media_position.carousel', MEDIA_POSITION.BEFORE_CONTENT, { shouldDirty: true });
                                                                form.setValue('media_position.image', undefined, { shouldDirty: true });
                                                            }}>
                                                                Horizontal
                                                            </Button>
                                                            <Button type='button' variant='outline' className={`${!carouselType ? 'bg-primary text-white' : ''}`} onClick={() => {
                                                                form.setValue('has_media.carousel', false, { shouldDirty: true });
                                                                form.setValue('has_media.image', true, { shouldDirty: true });
                                                                form.setValue('media_position.carousel', undefined, { shouldDirty: true });
                                                                form.setValue('media_position.image', MEDIA_POSITION.BEFORE_CONTENT, { shouldDirty: true });
                                                            }}>
                                                                Vertical
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="p-2">
                                                        <FormItem>Carousel Position</FormItem>
                                                        <div className="flex items-center gap-3">
                                                            <Button type='button' variant='outline' className={`${carouselPosition === MEDIA_POSITION.BEFORE_CONTENT ? 'bg-primary text-white' : ''}`} onClick={() => {
                                                                form.setValue('media_position.carousel', MEDIA_POSITION.BEFORE_CONTENT, { shouldDirty: true });
                                                                form.setValue('media_position.image', MEDIA_POSITION.BEFORE_CONTENT, { shouldDirty: true });
                                                            }}>
                                                                Before Content
                                                            </Button>
                                                            {/* <Button type='button' variant='outline' className={`${carouselPosition === MEDIA_POSITION.DYNAMIC_CONTENT ? 'bg-primary text-white' : ''}`} onClick={() => {
                                                                form.setValue('media_position.carousel', MEDIA_POSITION.DYNAMIC_CONTENT, { shouldDirty: true });
                                                            }}>
                                                                At Current Cursor Position
                                                            </Button> */}
                                                            <Button type='button' variant='outline' className={`${carouselPosition === MEDIA_POSITION.AFTER_CONTENT ? 'bg-primary text-white' : ''}`} onClick={() => {
                                                                form.setValue('media_position.carousel', MEDIA_POSITION.AFTER_CONTENT, { shouldDirty: true });
                                                                form.setValue('media_position.image', MEDIA_POSITION.AFTER_CONTENT, { shouldDirty: true });
                                                            }}>
                                                                After Content
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {
                                                        images.length > 0 ? (
                                                            <Carousel
                                                                opts={{
                                                                    align: "start",
                                                                }}
                                                                className="w-full"
                                                            >
                                                                <CarouselContent>
                                                                    {images.map((image, index) => (
                                                                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                                                            <div className="p-1">
                                                                                <div className="relative aspect-video">
                                                                                    <Image
                                                                                        src={image.url}
                                                                                        alt={`Carousel image ${index + 1}`}
                                                                                        fill
                                                                                        className="object-contain rounded-md border"
                                                                                    />
                                                                                    {
                                                                                        isEditing && (
                                                                                            <div className="flex justify-center items-center size-8 absolute bottom-2 right-2  rounded-full bg-destructive hover:bg-destructive/80 transition-all duration-300 cursor-pointer top-1" onClick={() => removeImage(index)}>
                                                                                                <X size={16} className='text-white' />
                                                                                            </div>
                                                                                        )
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </CarouselItem>
                                                                    ))}
                                                                </CarouselContent>
                                                                <CarouselPrevious className="left-2" type='button' />
                                                                <CarouselNext className="right-2" type='button' />
                                                            </Carousel>
                                                        ) : (
                                                            <Typography variant="p" className="text-sm text-gray-500 mt-2 text-center"> No images</Typography>
                                                        )
                                                    }
                                                </div>
                                                <DialogFooter>
                                                    <Button type='button' onClick={() => {
                                                        setModal({ carousel: false });
                                                    }}>
                                                        Save
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )
                                }
                            </div>
                        </form>
                    </Form>
                </div>
            )}
            {modal.newSection && (
                <Dialog open={modal.newSection} onOpenChange={() => setModal({ newSection: false })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Section</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-6" onSubmit={(e) => {
                            e.preventDefault();
                            onAddSection();
                        }}>
                            <div>
                                <label htmlFor="sectionName" className="block text-sm font-medium">
                                    Section Name
                                </label>
                                <Input
                                    id="sectionName"
                                    placeholder="Enter section name"
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button type='submit' disabled={isAdding} loading={{ isLoading: isAdding }}>
                                    Add
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
            {modal.dynamicVariable && (
                <Dialog open={modal.dynamicVariable} onOpenChange={() => setModal({ dynamicVariable: false })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Media</DialogTitle>
                        </DialogHeader>
                        <div className="flex gap-2 justify-between flex-wrap">
                            <Button variant="outline" type='button' className='w-[calc(50%-0.5rem)] h-20' onClick={() => setModal(prev => ({ ...prev, carousel: true }))}>
                                <GalleryHorizontal size={20} />
                                <span>Carousel</span>
                            </Button>
                            <Button variant="outline" type='button' className='w-[calc(50%-0.5rem)] h-20' onClick={() => setModal(prev => ({ ...prev, video: true }))}>
                                <VideoIcon size={20} />
                                <span>Video</span>
                            </Button>
                            <Button variant="outline" type='button' className='w-[calc(50%-0.5rem)] h-20' onClick={() => setModal(prev => ({ ...prev, table: true }))}>
                                <Table size={20} />
                                <span>Table</span>
                            </Button>
                            <Button variant="outline" type='button' className='w-[calc(50%-0.5rem)] h-20' onClick={() => setModal(prev => ({ ...prev, peopleCard: true }))}>
                                <Users size={20} />
                                <span>People Card</span>
                            </Button>
                            <Button variant="outline" type='button' className='w-[calc(50%-0.5rem)] h-20' onClick={() => setModal(prev => ({ ...prev, pdf: true }))}>
                                <FileIcon size={20} />
                                <span>PDF</span>
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            {modal.pdf && (
                <Dialog open={modal.pdf} onOpenChange={() => setModal({ pdf: false })}>
                    <DialogContent className='max-w-7xl'>
                        <DialogHeader>
                            <DialogTitle>PDF Files</DialogTitle>
                        </DialogHeader>
                        <div className="relative">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <Typography variant="p" className='font-semibold'>PDF Files</Typography>
                                    {pdfs.length > 0 && (
                                        <Button variant="destructive" type='button' onClick={removePDFs} disabled={!isEditing}>
                                            <X size={20} />
                                            <span>Remove PDFs</span>
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <label htmlFor="pdf-file-input" className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer'>
                                        <Plus size={20} />
                                        <span>Upload PDF</span>
                                    </label>
                                    <Button variant="outline" type='button' onClick={() => {
                                        appendPdf({ url: '', name: '', description: '' });
                                    }}>
                                        <Plus size={20} />
                                        <span>Add Link</span>
                                    </Button>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        id="pdf-file-input"
                                        onChange={async (e) => {
                                            const files = e.target.files;
                                            if (files) {
                                                for (const file of Array.from(files)) {
                                                    const url = await uploadFile(file);
                                                    if (url) {
                                                        appendPdf({ url, name: file.name, description: '' });
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="p-2">
                                <FormItem>PDF Position</FormItem>
                                <div className="flex items-center gap-3">
                                    <Button type='button' variant='outline' className={`${pdfPosition === MEDIA_POSITION.BEFORE_CONTENT ? 'bg-primary text-white' : ''}`} onClick={() => {
                                        form.setValue('has_media.pdf', true, { shouldDirty: true });
                                        form.setValue('media_position.pdf', MEDIA_POSITION.BEFORE_CONTENT, { shouldDirty: true });
                                    }}>
                                        Before Content
                                    </Button>
                                    <Button type='button' variant='outline' className={`${pdfPosition === MEDIA_POSITION.AFTER_CONTENT ? 'bg-primary text-white' : ''}`} onClick={() => {
                                        form.setValue('has_media.pdf', true, { shouldDirty: true });
                                        form.setValue('media_position.pdf', MEDIA_POSITION.AFTER_CONTENT, { shouldDirty: true });
                                    }}>
                                        After Content
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-4 mt-4">
                                {pdfs.map((pdf, index) => (
                                    <div key={index} className="flex gap-4 items-start">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder="PDF URL"
                                                value={pdf.url}
                                                onChange={(e) => {
                                                    const newPdfs = [...pdfs];
                                                    newPdfs[index].url = e.target.value;
                                                    form.setValue('pdfs', newPdfs, { shouldDirty: true });
                                                }}
                                            />
                                            <Input
                                                placeholder="PDF Name"
                                                value={pdf.name}
                                                onChange={(e) => {
                                                    const newPdfs = [...pdfs];
                                                    newPdfs[index].name = e.target.value;
                                                    form.setValue('pdfs', newPdfs, { shouldDirty: true });
                                                }}
                                            />
                                            <Input
                                                placeholder="PDF Description"
                                                value={pdf.description}
                                                onChange={(e) => {
                                                    const newPdfs = [...pdfs];
                                                    newPdfs[index].description = e.target.value;
                                                    form.setValue('pdfs', newPdfs, { shouldDirty: true });
                                                }}
                                            />
                                        </div>
                                        {isEditing && (
                                            <Button variant="destructive" size="icon" type='button' onClick={() => removePdf(index)}>
                                                <X size={16} />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {pdfs.length === 0 && (
                                    <Typography variant="p" className="text-sm text-gray-500 mt-2 text-center">No PDFs added</Typography>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type='button' onClick={() => {
                                setModal({ pdf: false });
                            }}>
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default TabSections