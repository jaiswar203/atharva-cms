import CollegeDetail from '@/components/College/CollegeDetail'
import React, { use } from 'react'

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params)
    return <CollegeDetail id={id} />
}

export default Page