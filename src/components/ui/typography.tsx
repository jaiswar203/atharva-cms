import { cn } from '@/lib/utils';
import React, { ReactNode } from 'react';

interface TypographyProps {
    variant: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'blockquote';
    children: ReactNode;
    className?: string;
}

const Typography: React.FC<TypographyProps> = ({ variant, children, className = '' }) => {
    const baseStyles = 'text-gray-800';

    const styles = {
        h1: `text-3xl font-bold  ${baseStyles}`,
        h2: `text-2xl font-semibold  ${baseStyles}`,
        h3: `text-xl font-medium  ${baseStyles}`,
        h4: `text-lg font-medium  ${baseStyles}`,
        p: `text-base leading-relaxed  ${baseStyles}`,
        blockquote: `border-l-4 pl-4 italic text-gray-600  ${baseStyles}`,
        span: `text-sm font-normal  ${baseStyles}`,
    };

    const Tag = variant as keyof React.JSX.IntrinsicElements;

    return (
        <Tag className={cn(styles[variant], className)}>
            {children}
        </Tag>
    );
};

export default Typography;