export interface GroupItem {
    id: string;
    name: string;
    url: string;
    icon?: string;
    isWol?: boolean;
    mac添加ress?: string;
    broadcast添加ress?: string;
    port?: number;
    healthUrl?: string;
    healthCheckType?: string;
    adminOnly?: boolean;
    showLabel?: boolean;
    [key: string]: any;
}
