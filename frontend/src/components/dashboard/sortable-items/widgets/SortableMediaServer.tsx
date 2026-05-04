import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Grid2 } from '@mui/material';
import React from 'react';

import { MediaServerWidget } from '../../../dashboard/base-items/widgets/MediaServerWidget/MediaServerWidget';

type Props = {
    id: string;
    editMode: boolean;
    isOverlay?: boolean;
    on删除?: () => void;
    on编辑?: () => void;
    onDuplicate?: () => void;
    config?: any;
    url?: string;
};

export const SortableMediaServer: React.FC<Props> = ({
    id,
    editMode,
    isOverlay = false,
    on删除,
    on编辑,
    onDuplicate,
    config,
    url
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    return (
        <Grid2
            size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 4 }}
            ref={!isOverlay ? setNodeRef : undefined}
            {...(!isOverlay ? attributes : {})}
            {...(!isOverlay ? listeners : {})}
            sx={{
                transition,
                transform: transform ? CSS.Translate.toString(transform) : undefined,
                opacity: isOverlay ? 0.6 : 1,
                visibility: isDragging ? 'hidden' : 'visible',
                touchAction: 'none',
                cursor: editMode ? 'grab' : 'auto'
            }}
        >
            <MediaServerWidget
                config={config}
                editMode={editMode}
                id={id}
                on编辑={on编辑}
                on删除={on删除}
                onDuplicate={onDuplicate}
            />
        </Grid2>
    );
};
