import { UseFormReturn } from 'react-hook-form';

import { QueueManagementWidgetConfig } from './QueueManagementWidgetConfig';
import { FormValues } from '../添加编辑Form/types';

interface RadarrWidgetConfigProps {
    formContext: UseFormReturn<FormValues>;
}

export const RadarrWidgetConfig: React.FC<RadarrWidgetConfigProps> = ({ formContext }) => {
    return (
        <QueueManagementWidgetConfig
            formContext={formContext}
            service名称='Radarr'
            defaultPort='7878'
        />
    );
};
