using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TestProject.Controllers;
using TestProject.Models;
using TestProject.Services;

namespace TestProjectTests.Controllers;

public class FilesControllerTests
{
    private readonly Mock<IStorageProvider> _mockStorageProvider;
    private readonly FilesController _controller;

    public FilesControllerTests()
    {
        _mockStorageProvider = new Mock<IStorageProvider>();
        _controller = new FilesController(_mockStorageProvider.Object);
    }

    [Fact]
    public async Task Browse_Success_ReturnsOkResult()
    {
        // Arrange
        var path = "test/path";
        var content = new StorageContent { CurrentPath = path };
        _mockStorageProvider.Setup(p => p.ListAsync(path)).ReturnsAsync(content);

        // Act
        var result = await _controller.Browse(path);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(content, okResult.Value);
    }

    [Fact]
    public async Task Browse_DirectoryNotFound_ReturnsNotFound()
    {
        // Arrange
        _mockStorageProvider.Setup(p => p.ListAsync(It.IsAny<string>())).ThrowsAsync(new DirectoryNotFoundException("Not found"));

        // Act
        var result = await _controller.Browse("invalid");

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
        var message = notFoundResult.Value?.GetType().GetProperty("message")?.GetValue(notFoundResult.Value, null);
        Assert.Equal("Not found", message);
    }

    [Fact]
    public async Task Browse_UnauthorizedAccess_ReturnsForbid()
    {
        // Arrange
        _mockStorageProvider.Setup(p => p.ListAsync(It.IsAny<string>())).ThrowsAsync(new UnauthorizedAccessException("Denied"));

        // Act
        var result = await _controller.Browse("secret");

        // Assert
        var forbidResult = Assert.IsType<ForbidResult>(result.Result);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public async Task Search_EmptyQuery_ReturnsBadRequest(string query)
    {
        // Act
        var result = await _controller.Search(query);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Search_ValidQuery_ReturnsOkResult()
    {
        // Arrange
        var content = new StorageContent { CurrentPath = "" };
        _mockStorageProvider.Setup(p => p.SearchAsync("query", "path")).ReturnsAsync(content);

        // Act
        var result = await _controller.Search("query", "path");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal(content, okResult.Value);
    }

    [Fact]
    public async Task Search_DirectoryNotFound_ReturnsNotFound()
    {
        // Arrange
        _mockStorageProvider.Setup(p => p.SearchAsync(It.IsAny<string>(), It.IsAny<string>())).ThrowsAsync(new DirectoryNotFoundException("Not found"));

        // Act
        var result = await _controller.Search("query", "invalid");

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
        var message = notFoundResult.Value?.GetType().GetProperty("message")?.GetValue(notFoundResult.Value, null);
        Assert.Equal("Not found", message);
    }

    [Fact]
    public async Task Search_UnauthorizedAccess_ReturnsForbid()
    {
        // Arrange
        _mockStorageProvider.Setup(p => p.SearchAsync(It.IsAny<string>(), It.IsAny<string>())).ThrowsAsync(new UnauthorizedAccessException("Denied"));

        // Act
        var result = await _controller.Search("query", "secret");

        // Assert
        var forbidResult = Assert.IsType<ForbidResult>(result.Result);
    }

    [Fact]
    public async Task Download_Success_ReturnsFileStreamResult()
    {
        // Arrange
        var stream = new MemoryStream();
        _mockStorageProvider.Setup(p => p.GetFileAsync("file.txt")).ReturnsAsync((stream, "text/plain", "file.txt"));

        // Act
        var result = await _controller.Download("file.txt");

        // Assert
        var fileResult = Assert.IsType<FileStreamResult>(result);
        Assert.Equal("text/plain", fileResult.ContentType);
        Assert.Equal("file.txt", fileResult.FileDownloadName);
    }

    [Fact]
    public async Task Download_FileNotFound_ReturnsNotFound()
    {
        // Arrange
        _mockStorageProvider.Setup(p => p.GetFileAsync("invalid.txt")).ThrowsAsync(new FileNotFoundException("Missing"));

        // Act
        var result = await _controller.Download("invalid.txt");

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task Upload_NoFile_ReturnsBadRequest()
    {
        // Act
        var result = await _controller.Upload("path", null!);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Upload_EmptyFile_ReturnsBadRequest()
    {
        // Arrange
        var mockFile = new Mock<IFormFile>();
        mockFile.Setup(f => f.Length).Returns(0);

        // Act
        var result = await _controller.Upload("path", mockFile.Object);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Upload_ValidFile_ReturnsOk()
    {
        // Arrange
        var mockFile = new Mock<IFormFile>();
        mockFile.Setup(f => f.Length).Returns(100);
        mockFile.Setup(f => f.FileName).Returns("test.txt");
        var stream = new MemoryStream();
        mockFile.Setup(f => f.OpenReadStream()).Returns(stream);

        // Act
        var result = await _controller.Upload("path", mockFile.Object);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        _mockStorageProvider.Verify(p => p.UploadFileAsync("path", "test.txt", stream), Times.Once);
    }

    [Fact]
    public async Task Upload_ProviderThrows_ReturnsStatusCode500()
    {
        // Arrange
        var mockFile = new Mock<IFormFile>();
        mockFile.Setup(f => f.Length).Returns(100);
        mockFile.Setup(f => f.FileName).Returns("test.txt");
        var stream = new MemoryStream();
        mockFile.Setup(f => f.OpenReadStream()).Returns(stream);
        _mockStorageProvider.Setup(p => p.UploadFileAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Stream>()))
            .ThrowsAsync(new Exception("Upload failed"));

        // Act
        var result = await _controller.Upload("path", mockFile.Object);

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, objectResult.StatusCode);
    }

    [Fact]
    public async Task Delete_Success_ReturnsOk()
    {
        // Act
        var result = await _controller.Delete("path");

        // Assert
        Assert.IsType<OkObjectResult>(result);
        _mockStorageProvider.Verify(p => p.DeleteAsync("path"), Times.Once);
    }

    [Fact]
    public async Task Delete_ProviderThrows_ReturnsStatusCode500()
    {
        // Arrange
        _mockStorageProvider.Setup(p => p.DeleteAsync(It.IsAny<string>())).ThrowsAsync(new Exception("Delete failed"));

        // Act
        var result = await _controller.Delete("path");

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, objectResult.StatusCode);
    }

    [Fact]
    public async Task Move_Success_ReturnsOk()
    {
        // Act
        var result = await _controller.Move("src", "dest");

        // Assert
        Assert.IsType<OkObjectResult>(result);
        _mockStorageProvider.Verify(p => p.MoveAsync("src", "dest"), Times.Once);
    }

    [Fact]
    public async Task Move_ProviderThrows_ReturnsStatusCode500()
    {
        // Arrange
        _mockStorageProvider.Setup(p => p.MoveAsync(It.IsAny<string>(), It.IsAny<string>())).ThrowsAsync(new Exception("Move failed"));

        // Act
        var result = await _controller.Move("src", "dest");

        // Assert
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, objectResult.StatusCode);
    }
}