namespace DelegacjaAPI.Models
{
    public class Delegacja
    {
        // AZURE TABLE KLUCZE:
        public string PartitionKey { get; set; } = "delegacja";  // stałe
        public string RowKey { get; set; } = string.Empty;  // ID delegacji (Guid)

        public string UserEmail { get; set; } = string.Empty;  
        public string PracownikImie { get; set; } = string.Empty;
        public string PracownikNazwisko { get; set; } = string.Empty;

        public string Miejsce { get; set; } = string.Empty;
        public DateTime DataRozpoczecia { get; set; }
        public DateTime DataZakonczenia { get; set; }
        public string Uwagi { get; set; } = "";

        public DateTimeOffset? Timestamp { get; set; }

    }
}