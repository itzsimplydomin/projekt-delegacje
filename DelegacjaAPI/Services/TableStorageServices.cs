using Azure;
using Azure.Data.Tables;
using DelegacjaAPI.Controllers;
using DelegacjaAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace DelegacjaAPI.Services
{
    public class TableStorageServices
    {
        private readonly TableClient _tableClient;

        public TableStorageServices(IConfiguration config)
        {
            string connectionString = config.GetConnectionString("AzureTableStorage");
            _tableClient = new TableClient(connectionString, "Delegacje");
        }

        public async Task<List<Delegacja>> GetAllDelegationsAsync()
        {
            await _tableClient.CreateIfNotExistsAsync();
            var queryResults = _tableClient.QueryAsync<TableEntity>();
            var delegacje = new List<Delegacja>();

            await foreach (var entity in queryResults)
            {
                delegacje.Add(new Delegacja
                {
                    PartitionKey = entity.PartitionKey,
                    RowKey = entity.RowKey,

                    UserEmail = entity["UserEmail"]?.ToString() ?? "",
                    PracownikImie = entity["PracownikImie"]?.ToString() ?? "",
                    PracownikNazwisko = entity["PracownikNazwisko"]?.ToString() ?? "",
                    Miejsce = entity["Miejsce"]?.ToString() ?? "",
                    DataRozpoczecia = DateTime.SpecifyKind(DateTime.Parse(entity["DataRozpoczecia"].ToString()),DateTimeKind.Utc),
                    DataZakonczenia = DateTime.SpecifyKind(DateTime.Parse(entity["DataZakonczenia"].ToString()),DateTimeKind.Utc),
                    Uwagi = entity["Uwagi"]?.ToString() ?? "",
 
                    Timestamp = entity.Timestamp
                });
            }

            Console.WriteLine($"Pobrano {delegacje.Count} delegacji z bazy danych");
            return delegacje;
        }

        public async Task<Delegacja> GetByIdDelegationAsync(string id)
        {
            if ( string.IsNullOrEmpty( id ) )
            {
                throw new ArgumentNullException( "Uzupełnij id" );
            }

            try
            {
                var response = await _tableClient.GetEntityAsync<TableEntity>("delegacja", id);
                var delegacje = new Delegacja()
                {
                    PartitionKey = response.Value.PartitionKey,
                    RowKey = response.Value.RowKey,
                    UserEmail = response.Value["UserEmail"]?.ToString() ?? "",
                    PracownikImie = response.Value["PracownikImie"]?.ToString() ?? "",
                    PracownikNazwisko = response.Value["PracownikNazwisko"]?.ToString() ?? "",
                    Miejsce = response.Value["Miejsce"]?.ToString() ?? "",
                    DataRozpoczecia = DateTime.SpecifyKind(DateTime.Parse(response.Value["DataRozpoczecia"].ToString()),DateTimeKind.Utc),
                    DataZakonczenia = DateTime.SpecifyKind(DateTime.Parse(response.Value["DataZakonczenia"].ToString()),DateTimeKind.Utc),
                    Uwagi = response.Value["Uwagi"]?.ToString() ?? "",
                    Timestamp = response.Value.Timestamp

                };
                return delegacje;
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                return null;
            }
        }
        public async Task<List<Delegacja>> GetDelegacjeAsync(string userEmail, bool isAdmin)
        {
            var all = await GetAllDelegationsAsync();

            if (isAdmin)
                return all;

            return all
                .Where(d => d.UserEmail == userEmail)
                .ToList();
        }


        public async Task<string> AddDelegationAsync(Delegacja delegacja)
        {
            var id = Guid.NewGuid().ToString(); //id delegacji

            var entity = new TableEntity("delegacja", id)
            {
                ["UserEmail"] = delegacja.UserEmail,
                ["PracownikImie"] = delegacja.PracownikImie,
                ["PracownikNazwisko"] = delegacja.PracownikNazwisko,
                ["Miejsce"] = delegacja.Miejsce,
                ["DataRozpoczecia"] = DateTime.SpecifyKind(delegacja.DataRozpoczecia, DateTimeKind.Utc),
                ["DataZakonczenia"] = DateTime.SpecifyKind(delegacja.DataZakonczenia, DateTimeKind.Utc),
                ["Uwagi"] = delegacja.Uwagi ?? "",
            };

            await _tableClient.AddEntityAsync(entity);

            return id;

        }

        public async Task DeleteDelegationAsync(string id)
        {
            if (string.IsNullOrEmpty(id)) throw new ArgumentNullException("ID nie może być puste");
            await _tableClient.DeleteEntityAsync("delegacja", id);
        }

        public async Task UpdateDelegationAsync(Delegacja delegacja)
        {

                var entity = new TableEntity("delegacja", delegacja.RowKey)
                {
                    ["UserEmail"] = delegacja.UserEmail,
                    ["PracownikImie"] = delegacja.PracownikImie,
                    ["PracownikNazwisko"] = delegacja.PracownikNazwisko,
                    ["Miejsce"] = delegacja.Miejsce,
                    ["DataRozpoczecia"] = DateTime.SpecifyKind(delegacja.DataRozpoczecia, DateTimeKind.Utc),
                    ["DataZakonczenia"] = DateTime.SpecifyKind(delegacja.DataZakonczenia, DateTimeKind.Utc),
                    ["Uwagi"] = delegacja.Uwagi ?? ""
                };

                await _tableClient.UpdateEntityAsync(entity,ETag.All,TableUpdateMode.Replace);
        }
    }
}