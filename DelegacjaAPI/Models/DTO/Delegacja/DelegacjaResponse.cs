using System;

namespace DelegacjaAPI.Models.DTO.Delegacja
{
    public class DelegacjaResponse
    {
        public string Id { get; set; } = "";  // RowKey z Azure

        public string UserEmail { get; set; } = "";
        public string PracownikImie { get; set; } = "";
        public string PracownikNazwisko { get; set; } = "";

        public string Miejsce { get; set; } = "";
        public DateTime DataRozpoczecia { get; set; }
        public DateTime DataZakonczenia { get; set; }
        public string Uwagi { get; set; } = "";
        public DateTimeOffset? Timestamp { get; set; }  

    }
}