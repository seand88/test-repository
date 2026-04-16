using Microsoft.AspNetCore.Mvc;
using TestProject.Models;
using TestProject.Services;

namespace TestProject.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IStorageProvider _storageProvider;

    public FilesController(IStorageProvider storageProvider)
    {
        _storageProvider = storageProvider;
    }

    [HttpGet("browse")]
    public async Task<ActionResult<StorageContent>> Browse([FromQuery] string path = "")
    {
        try
        {
            var content = await _storageProvider.ListAsync(path);
            return Ok(content);
        }
        catch (DirectoryNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpGet("search")]
    public async Task<ActionResult<StorageContent>> Search([FromQuery] string query, [FromQuery] string path = "")
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest(new { message = "Search query cannot be empty." });
        }

        try
        {
            var content = await _storageProvider.SearchAsync(query, path);
            return Ok(content);
        }
        catch (DirectoryNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpGet("download")]
    public async Task<IActionResult> Download([FromQuery] string path)
    {
        try
        {
            var (stream, contentType, fileName) = await _storageProvider.GetFileAsync(path);
            return File(stream, contentType, fileName);
        }
        catch (FileNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromQuery] string path, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded." });
        }

        try
        {
            using var stream = file.OpenReadStream();
            await _storageProvider.UploadFileAsync(path, file.FileName, stream);
            return Ok(new { message = "File uploaded successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> Delete([FromQuery] string path)
    {
        try
        {
            await _storageProvider.DeleteAsync(path);
            return Ok(new { message = "Deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}