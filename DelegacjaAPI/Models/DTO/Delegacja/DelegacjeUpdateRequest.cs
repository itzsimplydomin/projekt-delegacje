using System;

namespace DelegacjaAPI.Models.DTO.Delegacja
{
    public class DelegacjaUpdateRequest
    {

        public string? Miejsce { get; set; }

        public DateTime? DataRozpoczecia { get; set; }

        public DateTime? DataZakonczenia { get; set; }

        public string? Uwagi { get; set; }

    }
}