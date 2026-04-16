export enum StorageItemType {
    File = 0,
    Folder = 1
}

export interface StorageItem {
    name: string;
    relativePath: string;
    type: StorageItemType;
    size: number;
    lastModified: string;
    extension: string;
}

export interface StorageContent {
    currentPath: string;
    items: StorageItem[];
    folderCount: number;
    fileCount: number;
    totalSize: number;
}
