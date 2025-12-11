//Backend/model/request/authCreateAccountRequest.cs
using System.ComponentModel.DataAnnotations;
namespace MyApi.Model
{
    public class CreateAccountRequest
    {
        [Required]
        public string Username { get; set; } = default!;
        [Required]
        public string Email { get; set; } = default!;
        [Required]
        public string Password { get; set; } = default!;
    }
}
