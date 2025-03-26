'use client'
import { useGetHighlightByIdQuery } from '@/redux/api/college'
import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import HighlightDetail from '@/components/HighLight/HighlightDetail'
import { Loader2 } from 'lucide-react'

const HighlightPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const router = useRouter()
    const { id } = use(params)
    const { data, isLoading, isError } = useGetHighlightByIdQuery(id)

    const handleClose = () => {
        router.push('/highlights')
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (isError || !data?.data) {
        return <div className="text-center text-red-500">Error loading highlight. Please try again later.</div>
    }

    return (
        <div className="container mx-auto py-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-3xl font-bold mb-6">Edit Highlight</h1>
                <HighlightDetail 
                    highlight={data.data}
                    onClose={handleClose}
                />
            </div>
        </div>
    )
}

export default HighlightPage