using Azure.Data.Tables;
using DelegacjaAPI.Models;
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
                    // KLUCZE AZURE
                    PartitionKey = entity.PartitionKey,
                    RowKey = entity.RowKey,

                    // DANE PRACOWNIKA
                    PracownikID = Convert.ToInt32(entity["PracownikID"]),
                    PracownikImie = entity["PracownikImie"]?.ToString() ?? "",
                    PracownikNazwisko = entity["PracownikNazwisko"]?.ToString() ?? "",

                    // DANE DELEGACJI (WYMAGANE)
                    Miejsce = entity["Miejsce"]?.ToString() ?? "",
                    DataRozpoczecia = DateTime.Parse(entity["DataRozpoczecia"].ToString()),
                    DataZakonczenia = DateTime.Parse(entity["DataZakonczenia"].ToString()),
                    Uwagi = entity["Uwagi"]?.ToString() ?? "",

                    Timestamp = entity.Timestamp
                });
            }

            Console.WriteLine($"Pobrano {delegacje.Count} delegacji z bazy danych");
            return delegacje;
        }
    }
}