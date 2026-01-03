using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace DelegacjaAPI.Services
{
    public class BlobStorageService
    {
        private readonly BlobContainerClient _container;

        public BlobStorageService(IConfiguration config)
        {
            var connectionString = config["AzureBlobStorage"];
            var blobServiceClient = new BlobServiceClient(connectionString);

            _container = blobServiceClient.GetBlobContainerClient("delegacje-pdf");
            _container.CreateIfNotExists();
        }

        public async Task UploadPdfAsync(byte[] pdfBytes, string delegacjaId)
        {
            var blob = _container.GetBlobClient($"{delegacjaId}.pdf");

            using var stream = new MemoryStream(pdfBytes);

            await blob.UploadAsync(stream, overwrite: true);

            await blob.SetHttpHeadersAsync(new BlobHttpHeaders
            {
                ContentType = "application/pdf"
            });
        }

    }


}
