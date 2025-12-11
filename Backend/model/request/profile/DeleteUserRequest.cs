//Bakend/model/request/profile/DeleteUserRequest.cs
using System.ComponentModel.DataAnnotations;

namespace MyApi.Model;
public class DeleteUserRequest
{
    [Required]
    public string Password { get; set; } = default!;
}