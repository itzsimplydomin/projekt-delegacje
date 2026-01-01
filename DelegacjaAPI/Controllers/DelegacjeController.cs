using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DelegacjaAPI.Models;
using DelegacjaAPI.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Azure;
using DelegacjaAPI.Models.DTO.Delegacja;
using Microsoft.AspNetCore.Authorization;

namespace DelegacjaAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DelegacjeController : ControllerBase
    {
        private readonly TableStorageServices _tableService;
        public DelegacjeController(TableStorageServices tableService)
        {
            _tableService = tableService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var email = User.Identity!.Name!;
            var isAdmin = User.IsInRole("Admin");

            var delegacje = await _tableService.GetDelegacjeAsync(email, isAdmin);

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


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var delegacje = await _tableService.GetByIdDelegationAsync(id);
            if (delegacje == null)
            {
                return NotFound($"Nie znaleziono delegacji o ID: {id}");
            }
            return Ok(delegacje);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DelegacjaCreateRequest request)
        {
            try
            {

                // sprawdzenie poprawności daty5
                if (request.DataRozpoczecia > request.DataZakonczenia)
                {
                    return BadRequest(new { message = "Data zakończenia delegacji musi być późniejsza niż data rozpoczęcia!" });
                }
                var delegacja = new Delegacja
                {
                    Miejsce = request.Miejsce,
                    DataRozpoczecia = request.DataRozpoczecia,
                    DataZakonczenia = request.DataZakonczenia,
                    Uwagi = request.Uwagi,
                    UserEmail = User.Identity!.Name!

                };

                // Zapisanie do Azure przez Service
                var result = await _tableService.AddDelegationAsync(delegacja);

                Console.WriteLine($"Delegacja dodana z ID: {result}");
                return Ok(new
                {
                    success = true,
                    message = "Delegacja dodana pomyślnie!",
                    id = result
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Błąd dodawania: {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Błąd podczas dodawania delegacji"
                });

            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var email = User.Identity!.Name!;
            var isAdmin = User.IsInRole("Admin");

            var delegacja = await _tableService.GetByIdDelegationAsync(id);
            if (delegacja == null)
                return NotFound();

            if (!isAdmin && delegacja.UserEmail != email)
                return Forbid();

            await _tableService.DeleteDelegationAsync(id);
            return Ok(new { success = true });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] DelegacjaUpdateRequest request)
        {
            var email = User.Identity!.Name!;
            var isAdmin = User.IsInRole("Admin");

            var existing = await _tableService.GetByIdDelegationAsync(id);
            if (existing == null)
                return NotFound();


            if (!isAdmin && existing.UserEmail != email)
                return Forbid();

            existing.Miejsce = request.Miejsce ?? existing.Miejsce;
            existing.DataRozpoczecia = request.DataRozpoczecia ?? existing.DataRozpoczecia;
            existing.DataZakonczenia = request.DataZakonczenia ?? existing.DataZakonczenia;
            existing.Uwagi = request.Uwagi ?? existing.Uwagi;

            await _tableService.UpdateDelegationAsync(existing);

            return Ok(new { success = true });
        }
    }
}
