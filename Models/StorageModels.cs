namespace TestProject.Models;

public enum StorageItemType
{
    File,
    Folder
}

public class StorageItem
{
    public required string Name { get; set; }
    public required string RelativePath { get; set; }
    public StorageItemType Type { get; set; }
    public long Size { get; set; }
    public DateTime LastModified { get; set; }
    public string Extension { get; set; } = string.Empty;
}

public class StorageContent
{
    public required string CurrentPath { get; set; }
    public List<StorageItem> Items { get; set; } = new();
    public int FolderCount { get; set; }
    public int FileCount { get; set; }
    public long TotalSize { get; set; }
}
