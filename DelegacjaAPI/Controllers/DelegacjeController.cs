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

    }
}
