using Azure.Storage.Blobs;

namespace DelegacjaAPI.Services
{
    public class BlobStorageService
    {
        private readonly BlobContainerClient _container;

        public BlobStorageService(IConfiguration config)
        {
            var connectionString = config["AzureBlobStorage:ConnectionString"];
            var containerName = config["AzureBlobStorage:ContainerName"];

            var blobService = new BlobServiceClient(connectionString);
            _container = blobService.GetBlobContainerClient(containerName);
        }

        public async Task<string> UploadPdfAsync(
            byte[] pdfBytes,
            string delegacjaId)
        {
            var blobName = $"{delegacjaId}/delegacja.pdf";
            var blob = _container.GetBlobClient(blobName);

            using var stream = new MemoryStream(pdfBytes);
            await blob.UploadAsync(stream, overwrite: true);

            return blob.Uri.ToString();
        }
    }
}
