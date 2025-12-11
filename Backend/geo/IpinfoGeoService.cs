// Backend/Geo/IPinfoGeoService.cs
using IPinfo;
using Backend.Geo; // same namespace as your IGeoService & GeoInfo model


public class IPinfoGeoService : IGeoService
{
    private readonly IPinfoClient _client;

    public IPinfoGeoService(string token)
    {
        _client = new IPinfoClient.Builder()
            .AccessToken(token)
            .Build();
    }

public async Task<GeoInfo?> GetGeoInfoAsync(string ipAddress)
{
    string? errorMessage = null; // store exception message

    try
    {
        var details = await _client.IPApi.GetDetailsAsync(ipAddress);

        return new GeoInfo
        {
            CountryCode = details.Country,
            ContinentCode = details.Continent?.Code ?? ""
        };
    }
    catch (Exception ex)
    {
        errorMessage = ex.Message;  // save the message here
        var stackTrace = ex.StackTrace; // optional: store stack trace too

        // you can still log it if needed
        Console.Error.WriteLine($"IPinfoGeoService Error: {errorMessage}");
        Console.Error.WriteLine(stackTrace);

        return null;
    }
}

}
