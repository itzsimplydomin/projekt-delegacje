using DelegacjaAPI.Models;
using DelegacjaAPI.Models.DTO.Admin;
using DelegacjaAPI.Models.DTO.Auth;
using DelegacjaAPI.Models.DTO.Delegacja;
using DelegacjaAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DelegacjaAPI.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly TableStorageServices _tableService;
        private readonly UserServices _userService;

        public AdminController(UserServices userService, TableStorageServices tableService)
        {
            _userService = userService;
            _tableService = tableService;
        }
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

                var existing = await _userService.GetByEmailAsync(request.Email);
                if (existing != null)
                    return BadRequest("Użytkownik już istnieje");

                string salt = PasswordHasher.GenerateSalt();
                string hasloHash = PasswordHasher.HashPassword(request.Password, salt);

                var uzytkownik = new Uzytkownik
                {
                    PartitionKey = "user",
                    RowKey = request.Email.ToLower(),

                    Email = request.Email,
                    Imie = request.Imie,
                    Nazwisko = request.Nazwisko,
                    Rola = request.Rola,
                    Salt = salt,
                    HashHaslo = hasloHash
                };

                await _userService.CreateAsync(uzytkownik);

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
                return BadRequest(ex.ToString());
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userService.GetAllAsync();

            var response = users.Select(u => new UserListResponse
            {
                Email = u.Email,
                Imie = u.Imie,
                Nazwisko = u.Nazwisko,
                Rola = u.Rola
            });

            return Ok(response);
        }

        [HttpGet("users/{email}/delegacje")]
        public async Task<IActionResult> GetUserDelegacje(string email)
        {
            // sprawdzenie czy istnieje
            var user = await _userService.GetByEmailAsync(email);
            if (user == null)
                return NotFound("Użytkownik nie istnieje");
            //pobranie
            var delegacje = await _tableService.GetDelegacjeByUserAsync(
                email.ToLower().Trim()
            );

            var response = delegacje.Select(d => new DelegacjaResponse
            {
                Id = d.RowKey,
                UserEmail = d.UserEmail,
                PracownikImie = d.PracownikImie,
                PracownikNazwisko = d.PracownikNazwisko,
                Miejsce = d.Miejsce,
                DataRozpoczecia = d.DataRozpoczecia,
                DataZakonczenia = d.DataZakonczenia,
                Uwagi = d.Uwagi,
                Timestamp = d.Timestamp
            });

            return Ok(response);
        }
        [HttpDelete("users/{email}")]
        public async Task<IActionResult> DeleteUser(string email)
        {
            var normalizedEmail = email.ToLower().Trim();
            var loggedEmail = User.Identity!.Name!.ToLower().Trim();

            var user = await _userService.GetByEmailAsync(normalizedEmail);
            if (user == null)
                return NotFound("Użytkownik nie istnieje");

            //  nie możesz usunąć samego siebie
            if (normalizedEmail == loggedEmail)
                return BadRequest("Nie możesz usunąć samego siebie");

            // nie można usunąć ostatniego admina
            var allUsers = await _userService.GetAllAsync();
            var adminCount = allUsers.Count(u => u.Rola == "Admin");

            if (user.Rola == "Admin" && adminCount <= 1)
                return BadRequest("Nie można usunąć ostatniego administratora");

            // usuwanie delegacji
            await _tableService.DeleteDelegacjeByUserAsync(normalizedEmail);

            // usuwanie użytkownika
            await _userService.DeleteAsync(normalizedEmail);

            return Ok(new
            {
                success = true,
                message = "Użytkownik i jego delegacje zostały usunięte"
            });
        }

    }
}
