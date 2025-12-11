using System.ComponentModel.DataAnnotations;

namespace MyApi.Model;

public class EditSlugRequest
{
    [Required]
    public string NewSlug { get; set; } = string.Empty;
}