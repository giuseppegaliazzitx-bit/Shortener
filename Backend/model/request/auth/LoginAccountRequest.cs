//Backend/model/request/auth/LoginAccountRequest.cs
namespace MyApi.Model
{
    public class LoginAccountRequest
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
    }
}