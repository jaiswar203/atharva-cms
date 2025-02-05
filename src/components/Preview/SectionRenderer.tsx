import { ISection } from '@/redux/api/college'
import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import Image from 'next/image'
import { MEDIA_POSITION } from '@/types/college'

interface SectionRendererProps {
    children: React.ReactNode
    className?: string,
    section: ISection,
}

const SectionRenderer = ({ children, className, section }: SectionRendererProps) => {
    
    return (

        <div className={className}>
            {(section.has_media.pdf && section.media_position.pdf === MEDIA_POSITION.BEFORE_CONTENT && section.pdfs && section.pdfs.length > 0) && (
                <div className="px-6">
                    {section.pdfs.map((pdf, index) => (
                        <a
                            key={index}
                            href={pdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-row items-center justify-center p-4 bg-primary-foreground rounded-lg mt-5 cursor-pointer hover:opacity-90"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="text-primary font-medium">Download PDF {section.pdfs && section.pdfs.length > 1 ? index + 1 : ''}</span>
                        </a>
                    ))}
                </div>
            )}

            {(section.has_media.carousel && section.images.length > 0 && section.media_position.carousel === MEDIA_POSITION.BEFORE_CONTENT) && (
                <Carousel>
                    <CarouselContent>
                        {section.images.map((image, index) => (
                            <CarouselItem key={index} >
                                <div className="relative aspect-video">
                                    <Image
                                        src={image.url}
                                        alt={`Carousel image ${index + 1}`}
                                        fill
                                        className="object-contain rounded-md border"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" type='button' />
                    <CarouselNext className="right-2" type='button' />
                </Carousel>
            )}
            {
                (section.has_media.image && section.media_position.image === MEDIA_POSITION.BEFORE_CONTENT && section.images.length > 0) && section.images.map((image, index) => (
                    <div className="relative aspect-video" key={index}>
                        <Image
                            src={image.url}
                            alt={`Carousel image ${index + 1}`}
                            fill
                            className="object-contain rounded-md border"
                        />
                    </div>
                ))
            }
            {children}
            {(section.has_media.carousel && section.images.length > 0 && section.media_position.carousel === MEDIA_POSITION.AFTER_CONTENT) && (
                <Carousel>
                    <CarouselContent>
                        {section.images.map((image, index) => (
                            <CarouselItem key={index} >
                                <div className="relative aspect-video">
                                    <Image
                                        src={image.url}
                                        alt={`Carousel image ${index + 1}`}
                                        fill
                                        className="object-contain rounded-md border"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2" type='button' />
                    <CarouselNext className="right-2" type='button' />
                </Carousel>
            )}
            {
                (section.has_media.image && section.media_position.image === MEDIA_POSITION.AFTER_CONTENT && section.images.length > 0) && section.images.map((image, index) => (
                    <div className="relative aspect-video" key={index}>
                        <Image
                            src={image.url}
                            alt={`Carousel image ${index + 1}`}
                            fill
                            className="object-contain rounded-md border"
                        />
                    </div>
                ))
            }
            {(section.has_media.pdf && section.media_position.pdf === MEDIA_POSITION.AFTER_CONTENT && section.pdfs && section.pdfs.length > 0) && (
                <div className="px-6">
                    {section.pdfs.map((pdf, index) => (
                        <a
                            key={index}
                            href={pdf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-row items-center justify-center p-4 bg-primary-foreground rounded-lg mt-5 cursor-pointer hover:opacity-90"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="text-primary font-medium">Download PDF {section.pdfs && section.pdfs.length > 1 ? index + 1 : ''}</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SectionRenderer