namespace DelegacjaAPI.Models
{
    public class Delegacja
    {
        // WYMAGANE - zawsze muszą mieć wartość
        public string PartitionKey { get; set; } = string.Empty;
        public string RowKey { get; set; } = string.Empty;
        public string PracownikImie { get; set; } = string.Empty;
        public string PracownikNazwisko { get; set; } = string.Empty;
        public string Miejsce { get; set; } = string.Empty;

        // WYMAGANE - typy wartościowe nie mogą być null
        public int PracownikID { get; set; }  // automatycznie = 0
        public DateTime DataRozpoczecia { get; set; }  // automatycznie = DateTime.MinValue
        public DateTime DataZakonczenia { get; set; }  // automatycznie = DateTime.MinValue

        // OPCJONALNE - może być puste
        public string Uwagi { get; set; } = string.Empty;

        public DateTimeOffset? Timestamp { get; set; }
    }
}