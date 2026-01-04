using DelegacjaAPI.Services;
using DelegacjaAPI.Models;
using DelegacjaAPI.Models.DTO.Auth; 
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;


namespace DelegacjaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserServices _uzytkownikService;
        private readonly IConfiguration _config;

        public AuthController(UserServices uzytkownikService, IConfiguration config)
        {
            _uzytkownikService = uzytkownikService;
            _config = config;
        }


        [Authorize(Roles = "Admin")]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var allowedRoles = new[] { "Admin", "User" };

            if (!allowedRoles.Contains(request.Rola))
                return BadRequest("Nieprawidłowa rola");
            try
            {
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                    return BadRequest("Email i hasło są wymagane");

                var existing = await _uzytkownikService.GetByEmailAsync(request.Email);
                if (existing != null)
                    return BadRequest("Użytkownik już istnieje");

                string salt = PasswordHasher.GenerateSalt();
                string hasloHash = PasswordHasher.HashPassword(request.Password, salt);

                var uzytkownik = new Uzytkownik
                {
                    Email = request.Email,
                    Imie = request.Imie,
                    Nazwisko = request.Nazwisko,
                    Rola = request.Rola,
                    Salt = salt,
                    HashHaslo = hasloHash
                };

                await _uzytkownikService.CreateAsync(uzytkownik);

                var response = new UserResponse
                {
                    Email = uzytkownik.Email,
                    Imie = uzytkownik.Imie,
                    Nazwisko = uzytkownik.Nazwisko,
                    Rola = uzytkownik.Rola
                };

                return Ok(new
                {
                    success = true,
                    message = "Konto utworzone",
                    user = response
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Wewnętrzny błąd");
            }
        }
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var uzytkownik = await _uzytkownikService.GetByEmailAsync(request.Email);
            if (uzytkownik == null)
                return Unauthorized("Błędny email lub hasło");

            if (!PasswordHasher.VerifyPassword(
                request.Password,
                uzytkownik.Salt,
                uzytkownik.HashHaslo))
                return Unauthorized("Błędny email lub hasło");

            var claims = new List<Claim>
            {
            new Claim(ClaimTypes.Name, uzytkownik.Email),
            new Claim(ClaimTypes.Role, uzytkownik.Rola)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
            );

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    int.Parse(_config["Jwt:ExpireMinutes"]!)
                ),
                signingCredentials: new SigningCredentials(
                    key, SecurityAlgorithms.HmacSha256
                )
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = tokenString
            });
        }
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            // walidacja
            if (string.IsNullOrEmpty(request.CurrentPassword) || string.IsNullOrEmpty(request.NewPassword) || string.IsNullOrEmpty(request.ConfirmNewPassword))
            {
                return BadRequest("Wszystkie pola są wymagane");
            }

            if (request.NewPassword != request.ConfirmNewPassword)
            {
                return BadRequest("Nowe hasła nie są takie same");
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest("Hasło musi mieć minimum 6 znaków");
            }

            //pobranie aktualnego usera z JWT
            var email = User.Identity!.Name!;
            var user = await _uzytkownikService.GetByEmailAsync(email);

            if (user == null)
                return Unauthorized();

            // weryfikacja starego hasła
            var valid = PasswordHasher.VerifyPassword(
                request.CurrentPassword,
                user.Salt,
                user.HashHaslo
            );

            if (!valid)
                return BadRequest("Aktualne hasło jest nieprawidłowe");

            // nowe hasło
            var newSalt = PasswordHasher.GenerateSalt();
            var newHash = PasswordHasher.HashPassword(
                request.NewPassword,
                newSalt
            );

            //zapis do bazy
            await _uzytkownikService.UpdatePasswordAsync(
                email,
                newHash,
                newSalt
            );

            return Ok(new { success = true });
        }

    }
}