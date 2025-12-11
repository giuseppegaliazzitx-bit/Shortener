//Backend/controller/GeoService.cs
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace Backend.Geo;

public interface IGeoService
{
    Task<GeoInfo?> GetGeoInfoAsync(string ip);
}

public class GeoService : IGeoService
{
    private readonly HttpClient _httpClient;

    public GeoService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<GeoInfo?> GetGeoInfoAsync(string? ip)
    {
        if (string.IsNullOrWhiteSpace(ip))
            return null;

        if (ip == "::1")
            ip = "173.41.7.189";

        var url = $"https://ipapi.co/{ip}/json/";
        return await _httpClient.GetFromJsonAsync<GeoInfo>(url);
    }
}
