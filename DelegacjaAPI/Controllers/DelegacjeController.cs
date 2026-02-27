using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DelegacjaAPI.Models;
using DelegacjaAPI.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Azure;
using DelegacjaAPI.Models.DTO.Delegacja;
using Microsoft.AspNetCore.Authorization;
using QuestPDF.Fluent;
using DelegacjaAPI.Pdf;

namespace DelegacjaAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DelegacjeController : ControllerBase
    {
        private readonly TableStorageServices _tableService;
        private readonly UserServices _userService;

        public DelegacjeController(
            TableStorageServices tableService,
            UserServices userService
        )
        {
            _tableService = tableService;
            _userService = userService;
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
            var isAdmin = User.IsInRole("Admin");
            var loggedEmail = User.Identity!.Name!;

            if (request.DataRozpoczecia > request.DataZakonczenia)
                return BadRequest("Niepoprawny zakres dat");

            string email;
            string imie;
            string nazwisko;

            if (isAdmin && !string.IsNullOrEmpty(request.UserEmail))
            {
                // Admin moze komus stworzyc
                var user = await _userService.GetByEmailAsync(request.UserEmail);
                if (user == null)
                    return BadRequest("Użytkownik nie istnieje");

                email = user.Email;
                imie = user.Imie;
                nazwisko = user.Nazwisko;
            }
            else
            {
                // user dla siebie 
                var user = await _userService.GetByEmailAsync(loggedEmail);
                if (user == null)
                    return Unauthorized();

                email = user.Email;
                imie = user.Imie;
                nazwisko = user.Nazwisko;
            }

            var delegacja = new Delegacja
            {
                UserEmail = email,
                PracownikImie = imie,
                PracownikNazwisko = nazwisko,
                Miejsce = request.Miejsce,
                DataRozpoczecia = request.DataRozpoczecia,
                DataZakonczenia = request.DataZakonczenia,
                Uwagi = request.Uwagi
            };

            var id = await _tableService.AddDelegationAsync(delegacja);

            return Ok(new { success = true, id });
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
        [HttpPost("{id}/pdf")]
        public async Task<IActionResult> GeneratePdf(string id,[FromServices] BlobStorageService blobService)
        {
            var delegacja = await _tableService.GetByIdDelegationAsync(id);
            if (delegacja == null)
                return NotFound();

            var document = new DelegacjaPdf(delegacja);

            byte[] pdfBytes;
            using (var stream = new MemoryStream())
            {
                document.GeneratePdf(stream);
                pdfBytes = stream.ToArray();
            }

            // zapis do Azure Blob
            await blobService.UploadPdfAsync(pdfBytes, id);

            return File(
                pdfBytes,
                "application/pdf",
                $"delegacja-{id}.pdf"
            );
        }
        [Authorize(Roles = "Admin")]
        [HttpPost("monthly-pdf")]
        public async Task<IActionResult> GenerateMonthlyPdf(int year,int month,[FromServices] BlobStorageService blobService)
        {
            var delegacje = await _tableService
                .GetDelegacjeByMonthAsync(year, month);

            if (!delegacje.Any())
                return NotFound("Brak delegacji w podanym miesiącu.");

            var document = new DelegacjeMonthlyPdf(delegacje, year, month);

            byte[] pdfBytes;

            using (var stream = new MemoryStream())
            {
                document.GeneratePdf(stream);
                pdfBytes = stream.ToArray();
            }

            var fileName = $"delegacje-{year}-{month:D2}.pdf";

            // zapis lokalny
            var localPath = Path.Combine(
                Directory.GetCurrentDirectory(),
                fileName
            );

            await System.IO.File.WriteAllBytesAsync(localPath, pdfBytes);

            // zapis do Azure Blob
            await blobService.UploadPdfAsync(pdfBytes, fileName);

            return File(
                pdfBytes,
                "application/pdf",
                fileName
            );
        }


    }
}
