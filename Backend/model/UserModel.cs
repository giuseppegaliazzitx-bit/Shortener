// Backend/model/usermodel.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MyApi.Model; 
public class UserModel
{
    [Key] // This annotation is optional if the property is named 'Id' or 'UserModelId'
    public int Id { get; set; }

    [Required] // Makes sure this field cannot be null in the database
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string HashedPassword { get; set; } = string.Empty;

    public string? UserPfpUrl { get; set; }// Renamed to clarify it's a URL

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Set a default value

    public ICollection<LinkModel> Links { get; set; } = new List<LinkModel>();
}
