using Azure.Data.Tables;
using DelegacjaAPI.Models;

namespace DelegacjaAPI.Services
{
    public class TableStorageServices
    {
        private TableClient _tableClient; // łącznik z azure

        //konstruktor łączenie z baza
        public TableStorageServices(IConfiguration config)
        {
            //string connectionsString = config.GetConnectionString("AzureTableStorage");
        }

        //metoda // async ładuje połączenie z azure ale nie zawiesza aplikacji, mozna w tym czasie wykonywac inne czynnosci
        public async Task<List<Delegacja>> GetAllDelegationsAsync()
        {
            return new List<Delegacja>();
        }
    }
}
