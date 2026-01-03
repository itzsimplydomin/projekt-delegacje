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


        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
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
                    Rola = "User",
                    Salt = salt,
                    HashHaslo = hasloHash
                };

                await _uzytkownikService.CreateAsync(uzytkownik);

                var response = new UserResponse
                {
                    Email = uzytkownik.Email,
                    Imie = uzytkownik.Imie,
                    Nazwisko = uzytkownik.Nazwisko
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

    }
}