using Microsoft.Extensions.Options;
using TestProject.Models;

namespace TestProject.Services;

public class LocalDiskStorageProvider : IStorageProvider
{
    private readonly string _rootDir;

    public LocalDiskStorageProvider(IConfiguration configuration)
    {
        var rootDir = configuration.GetValue<string>("FileSystem:RootDir") ?? "Storage";
        _rootDir = Path.GetFullPath(rootDir);
        
        if (!Directory.Exists(_rootDir))
        {
            Directory.CreateDirectory(_rootDir);
        }
    }

    private string GetPhysicalPath(string relativePath)
    {
        relativePath = relativePath?.TrimStart('/', '\\') ?? string.Empty;
        var physicalPath = Path.GetFullPath(Path.Combine(_rootDir, relativePath));

        if (!physicalPath.StartsWith(_rootDir, StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Access denied: Path is outside the root directory.");
        }
        return physicalPath;
    }

    private string GetRelativePath(string physicalPath)
    {
        var relPath = Path.GetRelativePath(_rootDir, physicalPath).Replace('\\', '/');
        return relPath == "." ? "" : relPath;
    }

    public Task<StorageContent> ListAsync(string path)
    {
        var physicalPath = GetPhysicalPath(path);
        if (!Directory.Exists(physicalPath))
        {
            throw new DirectoryNotFoundException($"Directory not found: {path}");
        }

        var directoryInfo = new DirectoryInfo(physicalPath);
        var content = new StorageContent { CurrentPath = GetRelativePath(physicalPath) };

        foreach (var dir in directoryInfo.GetDirectories())
        {
            content.Items.Add(new StorageItem
            {
                Name = dir.Name,
                RelativePath = GetRelativePath(dir.FullName),
                Type = StorageItemType.Folder,
                LastModified = dir.LastWriteTime
            });
            content.FolderCount++;
        }

        foreach (var file in directoryInfo.GetFiles())
        {
            content.Items.Add(new StorageItem
            {
                Name = file.Name,
                RelativePath = GetRelativePath(file.FullName),
                Type = StorageItemType.File,
                Size = file.Length,
                LastModified = file.LastWriteTime,
                Extension = file.Extension
            });
            content.FileCount++;
            content.TotalSize += file.Length;
        }

        return Task.FromResult(content);
    }

    public Task<StorageContent> SearchAsync(string query, string path)
    {
        var physicalPath = GetPhysicalPath(path);
        if (!Directory.Exists(physicalPath))
        {
            throw new DirectoryNotFoundException($"Directory not found: {path}");
        }

        var content = new StorageContent { CurrentPath = GetRelativePath(physicalPath) };
        var options = new EnumerationOptions
        {
            IgnoreInaccessible = true,
            RecurseSubdirectories = true,
            MatchCasing = MatchCasing.CaseInsensitive
        };

        var directoryInfo = new DirectoryInfo(physicalPath);
        foreach (var info in directoryInfo.EnumerateFileSystemInfos($"*{query}*", options))
        {
            if (info is DirectoryInfo dir)
            {
                content.Items.Add(new StorageItem
                {
                    Name = dir.Name,
                    RelativePath = GetRelativePath(dir.FullName),
                    Type = StorageItemType.Folder,
                    LastModified = dir.LastWriteTime
                });
                content.FolderCount++;
            }
            else if (info is FileInfo file)
            {
                content.Items.Add(new StorageItem
                {
                    Name = file.Name,
                    RelativePath = GetRelativePath(file.FullName),
                    Type = StorageItemType.File,
                    Size = file.Length,
                    LastModified = file.LastWriteTime,
                    Extension = file.Extension
                });
                content.FileCount++;
                content.TotalSize += file.Length;
            }
        }

        return Task.FromResult(content);
    }

    public Task<(Stream stream, string contentType, string fileName)> GetFileAsync(string path)
    {
        var physicalPath = GetPhysicalPath(path);
        if (!File.Exists(physicalPath))
        {
            throw new FileNotFoundException($"File not found: {path}");
        }

        var stream = new FileStream(physicalPath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, true);
        var contentType = "application/octet-stream"; // Basic default
        return Task.FromResult(((Stream)stream, contentType, Path.GetFileName(physicalPath)));
    }

    public async Task UploadFileAsync(string path, string fileName, Stream stream)
    {
        var directoryPath = GetPhysicalPath(path);
        if (!Directory.Exists(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }

        var physicalPath = Path.Combine(directoryPath, fileName);
        // Security: Ensure the combined path is still within root
        if (!Path.GetFullPath(physicalPath).StartsWith(_rootDir, StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Access denied.");
        }

        using var fileStream = new FileStream(physicalPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, true);
        await stream.CopyToAsync(fileStream);
    }

    public Task DeleteAsync(string path)
    {
        var physicalPath = GetPhysicalPath(path);
        if (Directory.Exists(physicalPath))
        {
            Directory.Delete(physicalPath, true);
        }
        else if (File.Exists(physicalPath))
        {
            File.Delete(physicalPath);
        }
        return Task.CompletedTask;
    }

    public Task MoveAsync(string sourcePath, string destinationPath)
    {
        var physicalSource = GetPhysicalPath(sourcePath);
        var physicalDest = GetPhysicalPath(destinationPath);

        if (!File.Exists(physicalSource) && !Directory.Exists(physicalSource))
        {
            throw new FileNotFoundException($"Source not found: {sourcePath}");
        }

        if (!Directory.Exists(physicalDest))
        {
            throw new DirectoryNotFoundException($"Destination directory not found: {destinationPath}");
        }

        if (Directory.Exists(physicalSource))
        {
            var dirName = new DirectoryInfo(physicalSource).Name;
            var targetPath = Path.Combine(physicalDest, dirName);
            if (Directory.Exists(targetPath)) throw new InvalidOperationException("Destination already exists.");
            Directory.Move(physicalSource, targetPath);
        }
        else
        {
            var fileName = Path.GetFileName(physicalSource);
            var targetPath = Path.Combine(physicalDest, fileName);
            if (File.Exists(targetPath)) throw new InvalidOperationException("Destination already exists.");
            File.Move(physicalSource, targetPath);
        }
        
        return Task.CompletedTask;
    }
}
