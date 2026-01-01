using System;

namespace DelegacjaAPI.Models.DTO.Delegacja
{
    public class DelegacjaCreateRequest
    {

        public string Miejsce { get; set; } = "";

        public DateTime DataRozpoczecia { get; set; }

        public DateTime DataZakonczenia { get; set; }

        public string Uwagi { get; set; } = "";

    }
}