using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DelegacjaAPI.Models;
using DelegacjaAPI.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Azure;

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
        [HttpGet] 

        public async Task<IActionResult> GetAll()
        {
            var delegacje = await _tableService.GetAllDelegationsAsync();
            return Ok(delegacje);
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                await _tableService.DeleteDelegationAsync(id);

                Console.WriteLine($"Delegacja została usunięta z ID : {id}");
                return Ok(new
                {
                    success = true,
                    message = "Delegacja została usunięta pomyślnie"
                });
            }

            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                Console.WriteLine($"Delegacja z id: {id} nie istnieje");
                return NotFound(new { success = false, message = "Delegacja nie istnieje" });
            }
            catch(Exception ex)
            {
                Console.WriteLine($"Błąd usuwania {ex.Message}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Blad w usuwaniu delegacji"
                });
            }
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Delegacja delegacja)
        {
            try
            {
                await _tableService.UpdateDelegationAsync(id, delegacja);
                return Ok(); // dla testu
            }
            catch(Exception ex)
            {
                return StatusCode(500, ex.Message); //testowe
            }
            
        }
    }
}
