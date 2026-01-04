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
                var normalizedEmail = email.ToLower().Trim();

                var response = await _tableClient.GetEntityAsync<TableEntity>(
                    "uzytkownik",
                    normalizedEmail
                );

                return new Uzytkownik
                {
                    PartitionKey = response.Value.PartitionKey,
                    RowKey = response.Value.RowKey,
                    Email = response.Value["Email"]?.ToString() ?? "",
                    Imie = response.Value["Imie"]?.ToString() ?? "",
                    Nazwisko = response.Value["Nazwisko"]?.ToString() ?? "",
                    Rola = response.Value["Rola"]?.ToString() ?? "",
                    HashHaslo = response.Value["HashHaslo"]?.ToString() ?? "",
                    Salt = response.Value["Salt"]?.ToString() ?? ""
                };
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
                Rola = entity["Rola"]?.ToString() ?? "",
                HashHaslo = entity["HashHaslo"].ToString() ?? "",
                Salt = entity["Salt"]?.ToString() ?? ""
            };

        }
        public async Task UpdatePasswordAsync(string email, string newHash, string newSalt)
        {
            var normalizedEmail = email.ToLower().Trim();

            var entity = await _tableClient.GetEntityAsync<TableEntity>(
                "uzytkownik",
                normalizedEmail
            );

            entity.Value["HashHaslo"] = newHash;
            entity.Value["Salt"] = newSalt;

            await _tableClient.UpdateEntityAsync(
                entity.Value,
                entity.Value.ETag,
                TableUpdateMode.Replace
            );
        }
        public async Task<List<Uzytkownik>> GetAllAsync()
        {
            var users = new List<Uzytkownik>();

            await foreach (var entity in _tableClient.QueryAsync<TableEntity>())
            {
                users.Add(new Uzytkownik
                {
                    PartitionKey = entity.PartitionKey,
                    RowKey = entity.RowKey,
                    Email = entity["Email"]?.ToString() ?? "",
                    Imie = entity["Imie"]?.ToString() ?? "",
                    Nazwisko = entity["Nazwisko"]?.ToString() ?? "",
                    Rola = entity["Rola"]?.ToString() ?? "User"
                });
            }

            return users;
        }



    }

}
