export type FormValues = {
    shortcut名称?: string;
    page名称?: string;
    itemType: string;
    url?: string;
    healthUrl?: string;
    healthCheckType?: 'http' | 'ping';
    icon?: { path: string; name: string; source?: string } | null;
    showLabel?: boolean;
    widgetType?: string;
    placeholderSize?: string;
    // Weather widget
    temperatureUnit?: string;
    location?: { name: string; latitude: number; longitude: number } | null;
    // System monitor widget
    gauge1?: string;
    gauge2?: string;
    gauge3?: string;
    networkInterface?: string;
    showDiskUsage?: boolean;
    showSystemInfo?: boolean;
    showInternet状态?: boolean;
    showIP?: boolean;
    ipDisplayType?: 'wan' | 'lan' | 'both';
    // Disk monitor widget
    selectedDisks?: Array<{ mount: string; custom名称: string; showMountPath?: boolean }>;
    showIcons?: boolean;
    showMountPath?: boolean;
    show名称?: boolean;
    layout?: '2x2' | '2x4' | '1x6';
    // DateTime widget
    timezone?: string;
    use24Hour?: boolean;
    // Pihole widget
    piholeUrl?: string;
    piholeApiKey?: string;
    piholeHost?: string;
    piholePort?: string;
    piholeSsl?: boolean;
    piholeApiToken?: string;
    pihole密码?: string;
    pihole名称?: string;
    // AdGuard widget
    adguardHost?: string;
    adguardPort?: string;
    adguardSsl?: boolean;
    adguard用户名?: string;
    adguard密码?: string;
    adguard名称?: string;
    // Media server widget
    mediaServerType?: string;
    mediaServer名称?: string;
    msHost?: string;
    msPort?: string;
    msSsl?: boolean;
    msApiKey?: string;
    // Sonarr widget
    sonarr名称?: string;
    sonarrHost?: string;
    sonarrPort?: string;
    sonarrSsl?: boolean;
    sonarrApiKey?: string;

    // Radarr widget
    radarr名称?: string;
    radarrHost?: string;
    radarrPort?: string;
    radarrSsl?: boolean;
    radarrApiKey?: string;

    // Media Request Manager widget
    mediaRequestManagerService?: 'jellyseerr' | 'overseerr';
    mediaRequestManager名称?: string;
    mediaRequestManagerHost?: string;
    mediaRequestManagerPort?: string;
    mediaRequestManagerSsl?: boolean;
    mediaRequestManagerApiKey?: string;

    // Notes widget
    display名称?: string;
    defaultNoteFontSize?: string;

    // Torrent client widget
    torrentClient?: string;
    torrentUrl?: string;
    torrent用户名?: string;
    torrent密码?: string;
    torrentClientType?: string;
    tcHost?: string;
    tcPort?: string;
    tcSsl?: boolean;
    tc用户名?: string;
    tc密码?: string;

    // Dual Widget
    topWidgetType?: string;
    bottomWidgetType?: string;
    // Dual Widget - position-specific fields for top widget
    top_temperatureUnit?: string;
    top_location?: { name: string; latitude: number; longitude: number } | null;
    top_timezone?: string;
    top_use24Hour?: boolean;
    top_gauge1?: string;
    top_gauge2?: string;
    top_gauge3?: string;
    top_networkInterface?: string;
    top_showDiskUsage?: boolean;
    top_showSystemInfo?: boolean;
    top_showInternet状态?: boolean;
    top_showIP?: boolean;
    top_ipDisplayType?: 'wan' | 'lan' | 'both';
    top_selectedDisks?: Array<{ mount: string; custom名称: string; showMountPath?: boolean }>;
    top_showIcons?: boolean;
    top_showMountPath?: boolean;
    top_show名称?: boolean;
    top_layout?: '2x2' | '2x4' | '1x6';
    top_piholeHost?: string;
    top_piholePort?: string;
    top_piholeSsl?: boolean;
    top_piholeApiToken?: string;
    top_pihole密码?: string;
    top_pihole名称?: string;
    top_adguardHost?: string;
    top_adguardPort?: string;
    top_adguardSsl?: boolean;
    top_adguard用户名?: string;
    top_adguard密码?: string;
    top_adguard名称?: string;
    top_showLabel?: boolean;
    // Dual Widget - position-specific fields for bottom widget
    bottom_temperatureUnit?: string;
    bottom_location?: { name: string; latitude: number; longitude: number } | null;
    bottom_timezone?: string;
    bottom_use24Hour?: boolean;
    bottom_gauge1?: string;
    bottom_gauge2?: string;
    bottom_gauge3?: string;
    bottom_networkInterface?: string;
    bottom_showDiskUsage?: boolean;
    bottom_showSystemInfo?: boolean;
    bottom_showInternet状态?: boolean;
    bottom_showIP?: boolean;
    bottom_ipDisplayType?: 'wan' | 'lan' | 'both';
    bottom_selectedDisks?: Array<{ mount: string; custom名称: string; showMountPath?: boolean }>;
    bottom_showIcons?: boolean;
    bottom_showMountPath?: boolean;
    bottom_show名称?: boolean;
    bottom_layout?: '2x2' | '2x4' | '1x6';
    bottom_piholeHost?: string;
    bottom_piholePort?: string;
    bottom_piholeSsl?: boolean;
    bottom_piholeApiToken?: string;
    bottom_pihole密码?: string;
    bottom_pihole名称?: string;
    bottom_adguardHost?: string;
    bottom_adguardPort?: string;
    bottom_adguardSsl?: boolean;
    bottom_adguard用户名?: string;
    bottom_adguard密码?: string;
    bottom_adguard名称?: string;
    bottom_showLabel?: boolean;
    // Other fields
    adminOnly?: boolean;
    isWol?: boolean;
    mac添加ress?: string;
    broadcast添加ress?: string;
    port?: string;
    maxItems?: string;
};
