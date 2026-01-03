using System;

namespace DelegacjaAPI.Models.DTO.Delegacja
{
    public class DelegacjaCreateRequest
    {
        public string Miejsce { get; set; }
        public DateTime DataRozpoczecia { get; set; }
        public DateTime DataZakonczenia { get; set; }
        public string? Uwagi { get; set; }

        // dostępne dla admina
        public string? UserEmail { get; set; }
        public string? PracownikImie { get; set; }
        public string? PracownikNazwisko { get; set; }
    }

}