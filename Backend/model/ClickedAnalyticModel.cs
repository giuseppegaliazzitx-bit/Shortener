// Backend/model/clickedanalyticmodel.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; 
namespace MyApi.Model; 

public class ClickedAnalyticModel
{
    [Key]
    public int Id { get; set; }
    [Required]
    public DateTime ClickedOn { get; set; } = DateTime.UtcNow;
    public string? Continent { get; set; }

    public string? CountryCode { get; set; }

    public string? DeviceType { get; set; }

    public string? OsName { get; set; }

    public string? BrowserName { get; set; }
    // Foreign Key Relationship to Link
    [ForeignKey("Link")]
    public int LinkId { get; set; }
    [JsonIgnore]
    public LinkModel Link { get; set; } = default!;
    // Navigation property
}