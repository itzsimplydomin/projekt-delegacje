namespace DelegacjaAPI.Models
{
    public class Delegacja
    {
        public int Id { get; set; } 
        public string Pracownik { get; set; } = string.Empty;
        public DateTime DataOd { get; set; }
        public DateTime DataDo {  get; set; }
        public string Miejsce { get; set; } = string.Empty ;
        public string Uwagi { get; set; } = string .Empty ;
    }
}
