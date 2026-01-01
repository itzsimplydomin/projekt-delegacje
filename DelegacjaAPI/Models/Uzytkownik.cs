namespace DelegacjaAPI.Models
{
    public class Uzytkownik
    {
        public string PartitionKey { get; set; } = "uzytkownik";
        public string RowKey {  get; set; } = string.Empty;
        public int Id { get; set; }
        public string Imie { get; set; } = string.Empty;
        public string Nazwisko { get; set; } = string.Empty ;
        
        public string Email {  get; set; } = string.Empty ;

        public string Rola { get; set; } = "User";
        public string HashHaslo {  get; set; } = string.Empty ;

        public string Salt {  get; set; } = string.Empty ;
    }
}
