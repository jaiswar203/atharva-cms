import React from 'react'
import { SectionsList } from '../Section'

interface IProps {
    tabId: string
    collegeId: string
}

const TabSections = ({ tabId, collegeId }: IProps) => {
    return (
        <SectionsList 
            parentId={tabId}
            entityType="tab"
            collegeId={collegeId}
        />
    )
}

export default TabSections