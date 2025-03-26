import React, { useEffect, useState } from 'react'
import { ISection, useUpdateSectionByIdMutation } from '@/redux/api/college'
import { Button } from '../ui/button'
import { Edit, Check, X, VideoIcon, GalleryHorizontal, Users, Table, FileIcon } from 'lucide-react'
import Typography from '../ui/typography'
import { MEDIA_POSITION } from '@/types/college'
import MDXEditor from '../Editor/MDXEditor'
import { useFieldArray, useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { useFileUpload } from '@/hooks/useFileUpload'
import MarkdownRenderer from '../Editor/MarkdownRenderer'
import { MobilePreview } from '../Preview/Preview'
import { toast } from '@/hooks/use-toast'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import SectionRenderer from '../Preview/SectionRenderer'

export type ISectionFormInput = ISection<string, string>

interface ISectionEditorProps {
    section: ISection | null;
    entityId: string; // This can be collegeId, tabId, highlightId, etc.
    entityType: 'college' | 'tab' | 'highlight'; // Type of parent entity
    onUpdate?: (updatedSection: ISection) => void;
}

const SectionEditor = ({ section, entityId, onUpdate }: ISectionEditorProps) => {
    const { uploadFile } = useFileUpload()
    const [isEditing, setIsEditing] = useState(false)
    const [updateSectionByIdApi, { isLoading: isUpdating }] = useUpdateSectionByIdMutation()

    const [modal, setModal] = useState<{
        dynamicVariable?: boolean;
        video?: boolean;
        carousel?: boolean;
        peopleCard?: boolean;
        table?: boolean;
        pdf?: boolean;
    }>({
        dynamicVariable: false,
        video: false,
        carousel: false,
        peopleCard: false,
        table: false,
        pdf: false,
    });

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
        if (section) {
            const mediaPosition = {
                image: section.media_position?.image as MEDIA_POSITION | undefined,
                carousel: section.media_position?.carousel as MEDIA_POSITION | undefined,
                pdf: section.media_position?.pdf as MEDIA_POSITION | undefined,
                table: section.media_position?.table as MEDIA_POSITION | undefined,
                people_card: section.media_position?.people_card as MEDIA_POSITION | undefined,
                video: section.media_position?.video as MEDIA_POSITION | undefined,
            };

            form.reset({
                name: section.name,
                content: section.content,
                hide_heading: section.hide_heading,
                media_position: mediaPosition,
                images: section.images,
                has_media: section.has_media,
                pdfs: section.pdfs,
            })
        }
    }, [section])

    const handleImageUpload = async (file: File): Promise<string> => {
        const url = await uploadFile(file)
        if (!url) {
            throw new Error('Failed to upload image')
        }
        return url
    }

    const onSectionUpdate = async (data: ISectionFormInput) => {
        if (!section?._id) {
            toast({
                title: 'Section not found',
                description: 'Section not found',
            })
            return
        }
        try {
            const response = await updateSectionByIdApi({
                data,
                sectionId: section?._id,
                collegeId: entityId,
            }).unwrap()

            setIsEditing(false)
            toast({
                title: 'Section updated successfully',
                description: 'Section updated successfully',
            })

            // Call the onUpdate callback if provided
            if (onUpdate && response.data) {
                onUpdate(response.data)
            }
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

    if (!section) {
        return <Typography variant="p" className='text-sm text-gray-500'>No section selected</Typography>
    }

    return (
        <div>
            <div className="flex justify-between items-center">
                <Typography variant="h3" className='font-semibold'>{section?.name}</Typography>
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
                            <Button onClick={form.handleSubmit(onSectionUpdate)} disabled={!form.formState.isDirty || isUpdating} loading={{ isLoading: isUpdating }}>
                                <Check size={20} />
                                <span>Update</span>
                            </Button>
                        </div>
                    )
                }
            </div>

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
                                        _id: section._id,
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
                                                <GalleryHorizontal size={20} />
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
                        </div>
                    </form>
                </Form>
            </div>

            {/* Media Modals */}
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

            {/* Carousel Modal */}
            {modal.carousel && (
                <Dialog open={modal.carousel} onOpenChange={() => setModal({ carousel: false })}>
                    <DialogContent className='max-w-7xl'>
                        <DialogHeader>
                            <DialogTitle>Carousel Images</DialogTitle>
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
            )}

            {/* PDF Modal */}
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
                                        <span>Upload PDF</span>
                                    </label>
                                    <Button variant="outline" type='button' onClick={() => {
                                        appendPdf({ url: '', name: '', description: '' });
                                    }}>
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

export default SectionEditor 