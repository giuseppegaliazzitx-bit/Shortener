// Backend/model/request/profile/UpdateUserRequest.cs
using System.ComponentModel.DataAnnotations;

namespace MyApi.Model;

public class UpdateUserRequest
{
    public string? Username { get; set; }
    public string? UserPfpUrl { get; set; }

    public string? Email {get; set;}

    public string? NewPassword {get; set;   }

    [Required]
    public string Password { get; set; } = default!;
}
