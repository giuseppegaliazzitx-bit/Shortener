// Backend/controller/redirectionController.cs
using Microsoft.AspNetCore.Mvc;
using MyApi.Data;
using MyApi.Model;
using Microsoft.EntityFrameworkCore;
using Wangkanai.Detection.Services;
using Backend.Geo;

namespace MyApi.Controller;

[ApiController]
[Route("")]
public class RedirectionController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IDetectionService _detection;
    private readonly IGeoService _geo;

    public RedirectionController(AppDbContext db, IDetectionService detection, IGeoService geo)
    {
        _db = db;
        _detection = detection;
        _geo = geo;
    }
    
    // GET /{slug}
    [HttpGet("{slug}")]
    public async Task<IActionResult> RedirectToOriginalUrl(string slug)
    {
        // 1. Find link (Exact match)
        var link = await _db.Links.FirstOrDefaultAsync(l => l.Slug == slug);

        if (link == null)
        {
            return NotFound("Shortened URL not found.");
        }

        // 2. Update Link Stats & Save IMMEDIATELY
        // We save here so that if the analytics part crashes, the click is still counted.
        link.TotalClicks += 1;
        link.LastClickedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync(); 

        // 3. Gather Analytics Data (Defensive)
        var device = _detection.Device; 
        var browser = _detection.Browser;
        var platform = _detection.Platform;

        string continent = "Unknown";
        string countryCode = "Unknown";

        // GeoIP Lookup (Swallow errors so we don't block redirect)
        try
        {
             var ipAddress = "173.41.7.189";
            //HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
            // if (ipAddress == "::1" || ipAddress == "127.0.0.1")
            //     ipAddress = "173.41.7.189";
            // Handle headers if behind proxy (optional but recommended)
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                ipAddress = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            
            
            var geoInfo = await _geo.GetGeoInfoAsync(ipAddress!);
            if (geoInfo != null)
            {
                continent = geoInfo.ContinentCode ?? continent;
                countryCode = geoInfo.CountryCode ?? countryCode;
            }
        }
        catch (Exception err)
        {
            Console.Error.WriteLine($"GeoIP lookup Error: {err}");
        }

        // 4. Save Analytic (Defensive)
        var analytic = new ClickedAnalyticModel
        {
            LinkId = link.Id,
            ClickedOn = DateTime.UtcNow,
            Continent = continent,
            CountryCode = countryCode,
            // Wangkanai types are not nullable, but ?.ToString() is safe practice
            DeviceType = device?.Type.ToString() ?? "Unknown",
            OsName = platform?.Name.ToString() ?? "Unknown",
            BrowserName = browser?.Name.ToString() ?? "Unknown"
        };

        try
        {
            _db.ClickedAnalytics.Add(analytic);
            await _db.SaveChangesAsync();
        }
        catch 
        {
            Console.Error.WriteLine("Clicked analytics failed to save");
        }
        // 5. Redirect
        return Ok(new{url = link.OriginalUrl});
    }
}