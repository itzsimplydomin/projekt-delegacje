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

                    PracownikID = Convert.ToInt32(entity["PracownikID"]),
                    PracownikImie = entity["PracownikImie"]?.ToString() ?? "",
                    PracownikNazwisko = entity["PracownikNazwisko"]?.ToString() ?? "",

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
                    PracownikID = Convert.ToInt32(response.Value["PracownikID"]),
                    PracownikImie = response.Value["PracownikImie"]?.ToString() ?? "",
                    PracownikNazwisko = response.Value["PracownikNazwisko"]?.ToString() ?? "",
                    Miejsce = response.Value["Miejsce"]?.ToString() ?? "",
                    DataRozpoczecia = DateTime.Parse(response.Value["DataRozpoczecia"].ToString()),
                    DataZakonczenia = DateTime.Parse(response.Value["DataZakonczenia"].ToString()),
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

        public async Task<string> AddDelegationAsync(Delegacja delegacja)
        {
            var id = Guid.NewGuid().ToString(); //id delegacji

            var entity = new TableEntity("delegacja", id)
            {
                ["PracownikID"] = delegacja.PracownikID,
                ["PracownikImie"] = delegacja.PracownikImie,
                ["PracownikNazwisko"] = delegacja.PracownikNazwisko,
                ["Miejsce"] = delegacja.Miejsce,
                ["DataRozpoczecia"] = delegacja.DataRozpoczecia,
                ["DataZakonczenia"] = delegacja.DataZakonczenia,
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

        public async Task UpdateDelegationAsync(string id, Delegacja delegacja)
        {
            if (string.IsNullOrEmpty(id))
            {
                throw new ArgumentNullException("ID nie może być puste");
            }
            try
            {
                var response = await _tableClient.GetEntityAsync<TableEntity>("delegacja", id);
                var existing = response.Value;

                var updatedEntity = new TableEntity("delegacja", id)
                {
                    ["PracownikID"] = Convert.ToInt32(existing["PracownikID"]),
                    ["PracownikImie"] = existing["PracownikImie"]?.ToString() ?? "",
                    ["PracownikNazwisko"] = existing["PracownikNazwisko"]?.ToString() ?? "",

                    ["Miejsce"] = !string.IsNullOrEmpty(delegacja.Miejsce)
                    ? delegacja.Miejsce
                    : existing["Miejsce"]?.ToString() ?? "",

                    ["DataRozpoczecia"] = delegacja.DataRozpoczecia != DateTime.MinValue
                    ? delegacja.DataRozpoczecia
                    : DateTime.Parse(existing["DataRozpoczecia"].ToString()),

                    ["DataZakonczenia"] = delegacja.DataZakonczenia != DateTime.MinValue
                    ? delegacja.DataZakonczenia
                    : DateTime.Parse(existing["DataZakonczenia"].ToString()),

                    ["Uwagi"] = delegacja.Uwagi ?? existing["Uwagi"]?.ToString() ?? ""
                };
                await _tableClient.UpsertEntityAsync(updatedEntity);

                }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                throw new KeyNotFoundException($"Delegacja {id} nie istnieje");
            }




        }
    }
}