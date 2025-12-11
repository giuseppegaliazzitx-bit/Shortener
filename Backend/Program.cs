//Backend/Program.cs
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using MyApi.Data;
using System.Text;
using MyApi.Extension;
using Wangkanai.Detection;
using Backend.Geo;

var builder = WebApplication.CreateBuilder(args);

// DB
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Controllers (pre-existing framework function that scans files for class names ending with "controller")
builder.Services.AddControllers();

// Detection (Wangkanai)
builder.Services.AddDetection();

// Geo service (GeoIP)
// builder.Services.AddHttpClient<IGeoService, GeoService>();
var ipinfoToken = builder.Configuration["IPINFO_TOKEN"]; // reads from appsettings.json or environment variable
builder.Services.AddSingleton<IGeoService>(new IPinfoGeoService(ipinfoToken));


// JWT auth
builder.Services.AddJwtAuthentication(builder.Configuration); //Jwt extension method
builder.Services.AddAuthorization();

// CORS (extension)
builder.Services.AddFrontendCors("http://localhost:3000"); // your frontend URL

var app = builder.Build();

app.UseDetection(); // wakangkanai detection middleware
app.UseRouting(); //routing middleware pre-existing freamework
app.UseFrontendCors(); //custom cors middleware from extension
app.UseAuthentication(); //authentication middleware pre-existing framework
app.UseAuthorization(); //authorization middleware pre-existing framework
app.MapControllers(); //map controller endpoints
app.MapGet("/", () => "Hello World!");
app.Run();

