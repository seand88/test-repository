using Microsoft.Extensions.Configuration;
using Moq;
using TestProject.Services;
using TestProject.Models;

namespace TestProjectTests.Services;

public class LocalDiskStorageProviderTests : IDisposable
{
    private readonly string _testRootDir;
    private readonly LocalDiskStorageProvider _provider;

    public LocalDiskStorageProviderTests()
    {
        _testRootDir = Path.Combine(Path.GetTempPath(), "StorageTest_" + Guid.NewGuid().ToString());
        
        var inMemorySettings = new Dictionary<string, string?> {
            {"FileSystem:RootDir", _testRootDir}
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _provider = new LocalDiskStorageProvider(configuration);
    }

    public void Dispose()
    {
        if (Directory.Exists(_testRootDir))
        {
            Directory.Delete(_testRootDir, true);
        }
    }

    [Fact]
    public void Constructor_CreatesDirectoryIfItDoesNotExist()
    {
        Assert.True(Directory.Exists(_testRootDir));
    }

    [Fact]
    public async Task ListAsync_DirectoryDoesNotExist_ThrowsDirectoryNotFoundException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<DirectoryNotFoundException>(() => _provider.ListAsync("nonexistent"));
    }

    [Fact]
    public async Task ListAsync_PathOutsideRoot_ThrowsUnauthorizedAccessException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _provider.ListAsync("../outside"));
    }

    [Fact]
    public async Task ListAsync_ValidDirectory_ReturnsContent()
    {
        // Arrange
        Directory.CreateDirectory(Path.Combine(_testRootDir, "folder1"));
        File.WriteAllText(Path.Combine(_testRootDir, "file1.txt"), "content");

        // Act
        var content = await _provider.ListAsync("");

        // Assert
        Assert.Equal("", content.CurrentPath);
        Assert.Equal(1, content.FolderCount);
        Assert.Equal(1, content.FileCount);
        Assert.Contains(content.Items, i => i.Name == "folder1" && i.Type == StorageItemType.Folder);
        Assert.Contains(content.Items, i => i.Name == "file1.txt" && i.Type == StorageItemType.File && i.Extension == ".txt");
    }

    [Fact]
    public async Task SearchAsync_DirectoryDoesNotExist_ThrowsDirectoryNotFoundException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<DirectoryNotFoundException>(() => _provider.SearchAsync("query", "nonexistent"));
    }

    [Fact]
    public async Task SearchAsync_FindsMatchingFilesAndFolders()
    {
        // Arrange
        Directory.CreateDirectory(Path.Combine(_testRootDir, "matchFolder"));
        File.WriteAllText(Path.Combine(_testRootDir, "matchFile.txt"), "content");
        File.WriteAllText(Path.Combine(_testRootDir, "otherFile.txt"), "content");

        // Act
        var result = await _provider.SearchAsync("match", "");

        // Assert
        Assert.Equal(1, result.FolderCount);
        Assert.Equal(1, result.FileCount);
        Assert.Contains(result.Items, i => i.Name == "matchFolder");
        Assert.Contains(result.Items, i => i.Name == "matchFile.txt");
    }

    [Fact]
    public async Task GetFileAsync_FileNotFound_ThrowsFileNotFoundException()
    {
        await Assert.ThrowsAsync<FileNotFoundException>(() => _provider.GetFileAsync("missing.txt"));
    }

    [Fact]
    public async Task GetFileAsync_FileExists_ReturnsStream()
    {
        // Arrange
        var filePath = Path.Combine(_testRootDir, "test.txt");
        File.WriteAllText(filePath, "test content");

        // Act
        var (stream, contentType, fileName) = await _provider.GetFileAsync("test.txt");

        // Assert
        Assert.NotNull(stream);
        Assert.Equal("application/octet-stream", contentType);
        Assert.Equal("test.txt", fileName);

        stream.Dispose();
    }

    [Fact]
    public async Task UploadFileAsync_CreatesFile()
    {
        // Arrange
        var content = "test content"u8.ToArray();
        using var stream = new MemoryStream(content);

        // Act
        await _provider.UploadFileAsync("newfolder", "uploaded.txt", stream);

        // Assert
        var expectedPath = Path.Combine(_testRootDir, "newfolder", "uploaded.txt");
        Assert.True(File.Exists(expectedPath));
        Assert.Equal("test content", File.ReadAllText(expectedPath));
    }

    [Fact]
    public async Task UploadFileAsync_PathOutsideRoot_ThrowsUnauthorizedAccessException()
    {
        using var stream = new MemoryStream();
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _provider.UploadFileAsync("", "../outside.txt", stream));
    }

    [Fact]
    public async Task DeleteAsync_FileExists_DeletesFile()
    {
        // Arrange
        var filePath = Path.Combine(_testRootDir, "todelete.txt");
        File.WriteAllText(filePath, "content");

        // Act
        await _provider.DeleteAsync("todelete.txt");

        // Assert
        Assert.False(File.Exists(filePath));
    }

    [Fact]
    public async Task DeleteAsync_DirectoryExists_DeletesDirectory()
    {
        // Arrange
        var dirPath = Path.Combine(_testRootDir, "todeletedir");
        Directory.CreateDirectory(dirPath);

        // Act
        await _provider.DeleteAsync("todeletedir");

        // Assert
        Assert.False(Directory.Exists(dirPath));
    }

    [Fact]
    public async Task MoveAsync_SourceNotFound_ThrowsFileNotFoundException()
    {
        await Assert.ThrowsAsync<FileNotFoundException>(() => _provider.MoveAsync("missing.txt", "dest.txt"));
    }

    [Fact]
    public async Task MoveAsync_DestinationDirectoryNotFound_ThrowsDirectoryNotFoundException()
    {
        var sourcePath = Path.Combine(_testRootDir, "src.txt");
        File.WriteAllText(sourcePath, "content");
        await Assert.ThrowsAsync<DirectoryNotFoundException>(() => _provider.MoveAsync("src.txt", "missingDestFolder"));
    }

    [Fact]
    public async Task MoveAsync_MovesFileSuccessfully()
    {
        // Arrange
        var sourcePath = Path.Combine(_testRootDir, "src.txt");
        File.WriteAllText(sourcePath, "content");
        Directory.CreateDirectory(Path.Combine(_testRootDir, "destFolder"));

        // Act
        await _provider.MoveAsync("src.txt", "destFolder");

        // Assert
        Assert.False(File.Exists(sourcePath));
        Assert.True(File.Exists(Path.Combine(_testRootDir, "destFolder", "src.txt")));
    }

    [Fact]
    public async Task MoveAsync_MovesDirectorySuccessfully()
    {
        // Arrange
        var sourcePath = Path.Combine(_testRootDir, "srcFolder");
        Directory.CreateDirectory(sourcePath);
        Directory.CreateDirectory(Path.Combine(_testRootDir, "destFolder"));

        // Act
        await _provider.MoveAsync("srcFolder", "destFolder");

        // Assert
        Assert.False(Directory.Exists(sourcePath));
        Assert.True(Directory.Exists(Path.Combine(_testRootDir, "destFolder", "srcFolder")));
    }

    [Fact]
    public async Task MoveAsync_FileDestinationExists_ThrowsInvalidOperationException()
    {
        // Arrange
        var sourcePath = Path.Combine(_testRootDir, "src.txt");
        File.WriteAllText(sourcePath, "content");
        
        Directory.CreateDirectory(Path.Combine(_testRootDir, "destFolder"));
        File.WriteAllText(Path.Combine(_testRootDir, "destFolder", "src.txt"), "existing");

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _provider.MoveAsync("src.txt", "destFolder"));
    }

    [Fact]
    public async Task MoveAsync_DirectoryDestinationExists_ThrowsInvalidOperationException()
    {
        // Arrange
        var sourcePath = Path.Combine(_testRootDir, "srcFolder");
        Directory.CreateDirectory(sourcePath);
        
        Directory.CreateDirectory(Path.Combine(_testRootDir, "destFolder"));
        Directory.CreateDirectory(Path.Combine(_testRootDir, "destFolder", "srcFolder"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _provider.MoveAsync("srcFolder", "destFolder"));
    }
}