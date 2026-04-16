using TestProject.Models;

namespace TestProject.Services;

/**
 * IStorageProvider is created so we can swap the backend implementation later 
 */
public interface IStorageProvider
{
    /// <summary>
    /// Lists contents of a directory/prefix.
    /// </summary>
    Task<StorageContent> ListAsync(string path);

    /// <summary>
    /// Searches for files/folders matching a query.
    /// </summary>
    Task<StorageContent> SearchAsync(string query, string path);

    /// <summary>
    /// Retrieves a file stream for download.
    /// </summary>
    Task<(Stream stream, string contentType, string fileName)> GetFileAsync(string path);

    /// <summary>
    /// Uploads a file.
    /// </summary>
    Task UploadFileAsync(string path, string fileName, Stream stream);

    /// <summary>
    /// Moves a file or folder to a new destination path.
    /// </summary>
    Task MoveAsync(string sourcePath, string destinationPath);

    /// <summary>
    /// Deletes a file or folder.
    /// </summary>
    Task DeleteAsync(string path);
}
