import { 仪表盘Item } from '.';
import { GroupItem } from './group';

export interface DndDataForAppShortcut {
    type: string;
    id: string;
    originalItem?: 仪表盘Item;
}

export interface DndDataForGroupItem {
    type: 'group-item';
    parentId: string;
    originalItem?: GroupItem;
}

export interface DndDataForGroupWidget {
    type: 'group-widget';
    accepts: string[];
    canDrop: boolean;
}

export interface DndDataForGroupContainer {
    type: 'group-container';
    groupId: string;
    accepts: string;
}
