namespace DelegacjaAPI.Models.DTO.Auth
{
    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = "";
        public string NewPassword { get; set; } = "";
        public string ConfirmNewPassword { get; set; } = "";
    }
}
