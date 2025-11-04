namespace DelegacjaAPI.Models
{
    public class Uzytkownik
    {
        public int Id { get; set; }
        public string Imie { get; set; } = string.Empty;
        public string Nazwisko { get; set; } = string.Empty ;

        public string Email {  get; set; } = string.Empty ;

        public string Haslo {  get; set; } = string .Empty ;
    }
}
