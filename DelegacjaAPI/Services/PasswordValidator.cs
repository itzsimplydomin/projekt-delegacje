using System.Text.RegularExpressions;

namespace DelegacjaAPI.Services
{
    public static class PasswordValidator
    {
        public static bool IsValid(string password, out string error)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                error = "Hasło jest wymagane.";
                return false;
            }

            if (password.Length < 8)
            {
                error = "Hasło musi mieć co najmniej 8 znaków.";
                return false;
            }

            if (!Regex.IsMatch(password, "[A-Z]"))
            {
                error = "Hasło musi zawierać przynajmniej jedną wielką literę.";
                return false;
            }

            if (!Regex.IsMatch(password, "[a-z]"))
            {
                error = "Hasło musi zawierać przynajmniej jedną małą literę.";
                return false;
            }

            if (!Regex.IsMatch(password, "[0-9]"))
            {
                error = "Hasło musi zawierać przynajmniej jedną cyfrę.";
                return false;
            }

            if (!Regex.IsMatch(password, @"[\W_]"))
            {
                error = "Hasło musi zawierać przynajmniej jeden znak specjalny.";
                return false;
            }

            error = string.Empty;
            return true;
        }
    }
}