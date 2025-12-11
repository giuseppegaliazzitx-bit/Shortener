//Backend/model/linkmodel.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; 

namespace MyApi.Model; 

public class LinkModel
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string OriginalUrl { get; set; } = string.Empty;

    [Required]
    public string Slug { get; set; } = string.Empty;

    public int TotalClicks { get; set; } = 0; // Default to 0

    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    public DateTime? LastClickedOn { get; set; } // Nullable, as it might never have been clicked

    // Foreign Key Relationship to User
    [ForeignKey("User")]
    public int? UserId { get; set; }
    [JsonIgnore]
    public UserModel? User { get; set; }  = default!; //added newly aionfiaoissodmnanoifaiosndaosdanoisdasdasdi
    // Navigation Property: One link can have many click analytics
    public ICollection<ClickedAnalyticModel> ClickedAnalytics { get; set; } = new List<ClickedAnalyticModel>();
}
