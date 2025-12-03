using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DelegacjaAPI.Models;
using DelegacjaAPI.Services;

namespace DelegacjaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DelegacjeController : ControllerBase
    {
        private readonly TableStorageServices _tableService;

        public DelegacjeController(TableStorageServices tableService)
        {
            _tableService = tableService;
        }
        [HttpGet] //endpoint get 

        public async Task<IActionResult> GetAll()
        {
            var delegacje = await _tableService.GetAllDelegationsAsync();
            return Ok(delegacje);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Delegacja delegacja)
        {
            try
            {
                Console.WriteLine($"Dodawanie delegacji: {delegacja.PracownikID}");

                // sprawdzenie poprawności daty5
                if (delegacja.DataRozpoczecia > delegacja.DataZakonczenia)
                {
                    return BadRequest(new { message = "Data zakończenia delegacji musi być późniejsza niż data rozpoczęcia!" });
                }

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
    }
}
