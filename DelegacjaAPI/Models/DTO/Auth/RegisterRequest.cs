namespace DelegacjaAPI.Models.DTO.Auth
{
    public class RegisterRequest
    {
        public string Imie { get; set; } = "";
        public string Nazwisko { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }
}
