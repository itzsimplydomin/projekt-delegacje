using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DelegacjaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // GET: api/<AuthController>


        // POST api/<AuthController>
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (request.Email == "admin@artikon.pl" && request.Password == "test123")
            {
                return Ok(new { success = true, message = "Zalogowano pomyślnie" });
            }
            return Unauthorized(new { success = false, message = "Błędne dane!" });
        }
    }
}
