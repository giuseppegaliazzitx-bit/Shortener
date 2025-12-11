//Backend/model/request/link/CreateLinkRequest.cs

namespace MyApi.Model;
using System.ComponentModel.DataAnnotations;
public class CreateLinkRequest
{
    public string? CustomSlug { get; set; }
    [Required]
    public string OriginalUrl { get; set; } = default!;
}