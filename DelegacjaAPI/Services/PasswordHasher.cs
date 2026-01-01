using System.Security.Cryptography;
using System.Text;

namespace DelegacjaAPI.Services
{
    public static class PasswordHasher
    {
        public static string GenerateSalt()
        {
            byte [] saltBytes = new byte[16];

            using var random = RandomNumberGenerator.Create();

            random.GetBytes(saltBytes);

            return Convert.ToBase64String(saltBytes); // convert na string
        }

        public static string HashPassword(string password, string salt)
        {
            byte [] saltBytes = Convert.FromBase64String(salt); // convert na bytes
            byte [] passwordBytes = Encoding.UTF8.GetBytes(password); // convert na bytes 

            using var hmac = new HMACSHA256(saltBytes);
            byte [] hashbytes = hmac.ComputeHash(passwordBytes);

            return Convert.ToBase64String(hashbytes); // na string
        }

        public static bool VerifyPassword(string password, string salt, string storedHash)
        {
            string typedHashPassword = HashPassword(password, salt); // hashowanie podanego hasla
            return typedHashPassword == storedHash; // porównanie z hashowanym w bazie
        }
    }
}
