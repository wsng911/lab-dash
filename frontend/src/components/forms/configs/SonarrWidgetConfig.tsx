import { UseFormReturn } from 'react-hook-form';

import { QueueManagementWidgetConfig } from './QueueManagementWidgetConfig';
import { FormValues } from '../添加编辑Form/types';

interface SonarrWidgetConfigProps {
    formContext: UseFormReturn<FormValues>;
}

export const SonarrWidgetConfig: React.FC<SonarrWidgetConfigProps> = ({ formContext }) => {
    return (
        <QueueManagementWidgetConfig
            formContext={formContext}
            service名称='Sonarr'
            defaultPort='8989'
        />
    );
};
