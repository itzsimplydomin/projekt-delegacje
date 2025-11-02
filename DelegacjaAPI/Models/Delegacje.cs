namespace DelegacjaAPI.Models
{
    public class Delegacja
    {
        public int Id { get; set; } 
        public string Pracownik { get; set; }
        public DateTime DataOd { get; set; }
        public DateTime DataDo {  get; set; }
        public string Miejsce { get; set; }
        public string Uwagi { get; set; }
    }
}
