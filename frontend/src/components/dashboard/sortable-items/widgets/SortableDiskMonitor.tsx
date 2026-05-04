import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Grid2 } from '@mui/material';
import React from 'react';

import { Disk监控Widget } from '../../base-items/widgets/Disk监控Widget';
import { WidgetContainer } from '../../base-items/widgets/WidgetContainer';

type Props = {
    id: string;
    editMode: boolean;
    isOverlay?: boolean;
    config?: {
        selectedDisks?: Array<{ mount: string; custom名称: string; showMountPath?: boolean }>;
        showIcons?: boolean;
        showMountPath?: boolean;
        layout?: '2x2' | '2x4' | '1x5';
        [key: string]: any;
    };
    on删除?: () => void;
    on编辑?: () => void;
    onDuplicate?: () => void;
};

export const SortableDisk监控: React.FC<Props> = ({ id, editMode, isOverlay = false, config, on删除, on编辑, onDuplicate }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    // All layouts should use the same width as other widgets
    const getGridSize = () => {
        // Same width as other widgets regardless of layout
        return { xs: 12, sm: 6, md: 6, lg: 4, xl: 4 };
    };

    return (
        <Grid2
            size={getGridSize()}
            ref={!isOverlay ? setNodeRef : undefined}
            {...(!isOverlay ? attributes : {})}
            {...(!isOverlay ? listeners : {})}
            sx={{
                transition,
                transform: transform ? CSS.Translate.toString(transform) : undefined,
                opacity: isOverlay ? .6 : 1,
                visibility: isDragging ? 'hidden' : 'visible'
            }}
        >
            <WidgetContainer editMode={editMode} id={id} on删除={on删除} on编辑={on编辑} onDuplicate={onDuplicate}>
                <Disk监控Widget config={config} editMode={editMode} />
            </WidgetContainer>
        </Grid2>
    );
};
