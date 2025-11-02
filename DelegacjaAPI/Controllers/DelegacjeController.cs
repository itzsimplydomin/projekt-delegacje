using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DelegacjaAPI.Models;

namespace DelegacjaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DelegacjeController : ControllerBase
    {
        [HttpGet] //endpoint get 
        public IActionResult GetAll()
        {
            var delegacje = new List<Delegacja>
            {
                new Delegacja
                {
                    Id= 1,
                    Pracownik = "Jan Kowalski",
                    DataOd =DateTime.Now,
                    DataDo = DateTime.Now.AddDays(5),
                    Miejsce = "Warszawa",
                }
            };
            return Ok(delegacje);
        }
    }
}
