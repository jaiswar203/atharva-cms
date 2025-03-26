import { useGetSectionByIdQuery } from '@/redux/api/college'
import { SectionEditor } from './'
import { Loader2 } from 'lucide-react'
import Typography from '../ui/typography'

interface ISingleSectionProps {
    sectionId: string;
    collegeId: string;
    entityType: 'college' | 'tab' | 'highlight';
    tabId: string;
}

const SingleSection = ({ sectionId, collegeId, entityType, tabId }: ISingleSectionProps) => {
    const { data, isLoading, error } = useGetSectionByIdQuery({
        collegeId,
        sectionId,
        tabId
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-32">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    if (error || !data?.data) {
        return (
            <Typography variant="p" className="text-destructive">
                Failed to load section
            </Typography>
        );
    }

    return (
        <SectionEditor
            section={data.data}
            entityId={collegeId}
            entityType={entityType}
        />
    );
}

export default SingleSection; 