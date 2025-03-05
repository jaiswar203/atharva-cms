'use client'
import { useGetFestivalByIdQuery } from '@/redux/api/college'
import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import FestivalDetail from '@/components/Festival/FestivalDetail'
import { Loader2 } from 'lucide-react'

const FestivalPage =  ({ params }: { params: Promise<{ id: string }> }) => {
    const router = useRouter()
    const { id } = use(params)
    const { data, isLoading, isError } = useGetFestivalByIdQuery(id)

    const handleClose = () => {
        router.push('/festivals')
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (isError || !data?.data) {
        return <div className="text-center text-red-500">Error loading festival. Please try again later.</div>
    }

    return (
        <div className="container mx-auto py-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-3xl font-bold mb-6">Edit Festival</h1>
                <FestivalDetail 
                    festival={data.data}
                    onClose={handleClose}
                />
            </div>
        </div>
    )
}

export default FestivalPage