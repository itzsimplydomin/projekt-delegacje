using Azure;
using Azure.Data.Tables;
using DelegacjaAPI.Models;
using Microsoft.Extensions.Configuration;
using System.Linq.Expressions;

namespace DelegacjaAPI.Services
{
    public class UserServices
    {
        private readonly TableClient _tableClient;
        public UserServices(IConfiguration config)
        {
            string connectionString = config.GetConnectionString("AzureTableStorage");
            _tableClient = new TableClient(connectionString, "Uzytkownik");
            _tableClient.CreateIfNotExistsAsync().Wait();
        }
        public async Task<Uzytkownik?> GetByEmailAsync(string email)
        {
            try
            {
                string normEmail = email.ToLower().Trim();

                var response = await _tableClient.GetEntityAsync<TableEntity>(partitionKey: "uzytkownik", rowKey: normEmail);
                return MapToUzytkownik(response.Value);
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                return null;
            }
        }

        public async Task CreateAsync(Uzytkownik user)
        {
            user.RowKey = user.Email.ToLower().Trim();
            user.PartitionKey = "uzytkownik";

            var entity = new TableEntity("uzytkownik", user.Email.ToLower().Trim())
            {
                ["Imie"] = user.Imie,
                ["Nazwisko"] = user.Nazwisko,
                ["Email"] = user.Email,
                ["Rola"] = user.Rola,
                ["HashHaslo"] = user.HashHaslo,
                ["Salt"] = user.Salt,
            };

            await _tableClient.AddEntityAsync(entity);

        }

         public Uzytkownik MapToUzytkownik(TableEntity entity)
        {
            return new Uzytkownik 
            {
                PartitionKey = entity.PartitionKey,
                RowKey = entity.RowKey,
                Imie = entity["Imie"]?.ToString() ?? "",
                Nazwisko = entity["Nazwisko"]?.ToString() ?? "",
                Email = entity["Email"]?.ToString() ?? "",
                Rola = entity["Rola"]?.ToString() ?? "User",
                HashHaslo = entity["HashHaslo"].ToString() ?? "",
                Salt = entity["Salt"]?.ToString() ?? ""
            };

        }
    }
}
