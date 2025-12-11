using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MyApi.Controller;
using MyApi.Data;
using MyApi.Model;
using Xunit;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Moq;
using Backend.Geo;
using Wangkanai.Detection.Models;
using  Wangkanai.Detection.Services;
using System.Net;

namespace Backend.Tests;

public class AuthControllerTests
{
    private AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // fresh DB per test
            .Options;

        return new AppDbContext(options);
    }

    private IConfiguration CreateConfiguration()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Jwt:Key", "THIS_IS_A_DEMO_SECRET_KEY_1234567890" },
            { "Jwt:Issuer", "MyApi" }
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();
    }

    [Fact]
    public async Task CreateAccount_ReturnsOk_WhenDataIsValidAndUnique()
    {
        // Arrange
        var db = CreateInMemoryDbContext();
        var config = CreateConfiguration();
        var controller = new AuthController(db, config);

        var request = new CreateAccountRequest
        {
            Username = "newuser",
            Email = "newuser@example.com",
            Password = "StrongPassword123"
        };

        // Act
        var result = await controller.CreateAccount(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);

        // Response is an anonymous type, so we just check not null and DB state
        Assert.NotNull(okResult.Value);

        var userInDb = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        Assert.NotNull(userInDb);
        Assert.Equal(request.Username, userInDb!.Username);
    }

    [Fact]
    public async Task CreateAccount_ReturnsConflict_WhenEmailAlreadyExists()
    {
        // Arrange
        var db = CreateInMemoryDbContext();
        var config = CreateConfiguration();
        var controller = new AuthController(db, config);

        // Seed an existing user
        db.Users.Add(new UserModel
        {
            Username = "existing",
            Email = "existing@example.com",
            HashedPassword = BCrypt.Net.BCrypt.HashPassword("Password123"),
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var request = new CreateAccountRequest
        {
            Username = "anotheruser",
            Email = "existing@example.com", // same email
            Password = "Whatever123"
        };

        // Act
        var result = await controller.CreateAccount(request);

        // Assert
        var conflictResult = Assert.IsType<ConflictObjectResult>(result);
        Assert.Equal(409, conflictResult.StatusCode);
        Assert.NotNull(conflictResult.Value);
    }

    [Fact]
    public async Task Login_ReturnsOk_WithToken_WhenCredentialsAreValid()
    {
        // Arrange
        var db = CreateInMemoryDbContext();
        var config = CreateConfiguration();
        var controller = new AuthController(db, config);

        var password = "Secret123!";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

        var user = new UserModel
        {
            Username = "loginuser",
            Email = "login@example.com",
            HashedPassword = hashedPassword,
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var request = new LoginAccountRequest
        {
            Email = "login@example.com",
            Password = password
        };

        // Act
        var result = await controller.Login(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);
        Assert.NotNull(okResult.Value);

        // Serialize the anonymous object to JSON, then read the properties
        var json = JsonSerializer.Serialize(okResult.Value);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        var token = root.GetProperty("token").GetString();
        var email = root.GetProperty("email").GetString();

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.Equal(user.Email, email);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenPasswordIsWrong()
    {
        // Arrange
        var db = CreateInMemoryDbContext();
        var config = CreateConfiguration();
        var controller = new AuthController(db, config);

        var correctPassword = "CorrectPassword123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(correctPassword);

        db.Users.Add(new UserModel
        {
            Username = "user",
            Email = "user@example.com",
            HashedPassword = hashedPassword,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var request = new LoginAccountRequest
        {
            Email = "user@example.com",
            Password = "WrongPassword"
        };

        // Act
        var result = await controller.Login(request);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(401, unauthorizedResult.StatusCode);
        Assert.NotNull(unauthorizedResult.Value);
    }
}

// public class LinkControllerTests

// {
//     private AppDbContext CreateDbContext()
//     {
//         var options = new DbContextOptionsBuilder<AppDbContext>()
//             .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
//             .Options;

//         return new AppDbContext(options);
//     }

//     private LinkController CreateController(AppDbContext db, int userId, string email = "test@example.com")
//     {
//         // Fake authenticated user with sub claim = userId
//         var claims = new[]
//         {
//             new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
//             new Claim(JwtRegisteredClaimNames.Email, email)
//         };

//         var identity = new ClaimsIdentity(claims, "TestAuth");
//         var user = new ClaimsPrincipal(identity);

//         var controller = new LinkController(db);
//         controller.ControllerContext = new ControllerContext
//         {
//             HttpContext = new DefaultHttpContext
//             {
//                 User = user
//             }
//         };

//         return controller;
//     }

//     [Fact]
//     public async Task CreateShortenedLink_CreatesLink_AndReturnsOk()
//     {
//         // Arrange
//         using var db = CreateDbContext();

//         var user = new UserModel
//         {
//             Id = 1,
//             Email = "user@example.com",
//             Username = "testuser",
//             HashedPassword = "ignored",
//             CreatedAt = DateTime.UtcNow
//         };
//         db.Users.Add(user);
//         await db.SaveChangesAsync();

//         var controller = CreateController(db, user.Id, user.Email);

//         var request = new CreateLinkRequest
//         {
//             OriginalUrl = "https://google.com",
//             CustomSlug = null
//         };

//         // Act
//         var result = await controller.CreateShortenedLink(request);

//         // Assert
//         var okResult = Assert.IsType<OkObjectResult>(result);
//         Assert.NotNull(okResult.Value);

//         // Verify link created in DB
//         var links = await db.Links.Where(l => l.UserId == user.Id).ToListAsync();
//         Assert.Single(links);
//         Assert.Equal("https://google.com", links[0].OriginalUrl);
//         Assert.False(string.IsNullOrWhiteSpace(links[0].Slug));
//     }
//     [Fact]
//     public async Task GetLinks()
//     {
//         // Arrange
//         using var db = CreateDbContext();
//         var user = new UserModel
//         {
//             Id = 1,
//             Email = "pro@email.com",
//             Username = "prouser",
//             HashedPassword = "ignored",
//             CreatedAt = DateTime.UtcNow
//         };
//         db.Users.Add(user);
//         await db.SaveChangesAsync();

//         //seed some links
//         db.Links.Add(new LinkModel
//         {
//             OriginalUrl = "https://example.com/1",
//             Slug = "ex1",
//             UserId = user.Id,
//             CreatedOn = DateTime.UtcNow,
//             TotalClicks = 5
//         });
//         db.Links.Add(new LinkModel
//         {
//             OriginalUrl = "https://example.com/2",
//             Slug = "ex2",
//             UserId = user.Id,
//             CreatedOn = DateTime.UtcNow,
//             TotalClicks = 3
//         });
//         await db.SaveChangesAsync();
//         var controller = CreateController(db, user.Id, user.Email);

//         // Act
//         var result = await controller.GetUserLinks();
//         // Assert
//         var okResult = Assert.IsType<OkObjectResult>(result);
//         Assert.NotNull(okResult.Value);
//     }
// }

// public class RedirectionControllerTests // <-- Corrected class name
// {
//     // Helper to create an in-memory DbContext for each test
//     private AppDbContext CreateDbContext() // Changed from CreateInMemoryDbContext for brevity, but same func.
//     {
//         var options = new DbContextOptionsBuilder<AppDbContext>()
//             .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Ensures a fresh DB for each test
//             .Options;

//         return new AppDbContext(options);
//     }
    
//     private RedirectionController CreateController(
//         AppDbContext db,
//         IDetectionService detectionService,
//         IGeoService geoService,
//         string remoteIpAddress = null,
//         string xForwardedFor = null)
//     {
//         var controller = new RedirectionController(db, detectionService, geoService);

//         var httpContext = new DefaultHttpContext();

//         if (remoteIpAddress != null)
//         {
//             httpContext.Connection.RemoteIpAddress = IPAddress.Parse(remoteIpAddress);
//         }

//         if (xForwardedFor != null)
//         {
//             httpContext.Request.Headers["X-Forwarded-For"] = xForwardedFor;
//         }

//         controller.ControllerContext = new ControllerContext
//         {
//             HttpContext = httpContext
//         };

//         return controller;
//     }

//     [Fact]
//     public async Task RedirectToOriginalUrl_SavesCorrectGeoAnalytics_WhenGeoServiceSucceeds()
//     {
//         // Arrange
//         using var db = CreateDbContext();
//         // seed a link
//         var link = new Link { Id = 1, Slug = "abc", OriginalUrl = "https://example.com", TotalClicks = 0 };
//         db.Links.Add(link);
//         await db.SaveChangesAsync();

//         // Mock IGeoService
//         var mockGeo = new Mock<IGeoService>();
//         mockGeo.Setup(g => g.GetGeoInfoAsync(It.IsAny<string>()))
//             .ReturnsAsync(new GeoInfo { ContinentCode = "EU", CountryCode = "DE" });

//         // Mock Wangkanai detection objectss
//         var mockDevice = new Mock<IDeviceService>();
//         mockDevice.SetupGet(d => d.Type).Returns(DeviceType.Desktop); // enum from Wangkanai

//         var mockBrowser = new Mock<IBrowserService>();
//         mockBrowser.SetupGet(b => b.Name).Returns("Safari");

//         var mockPlatform = new Mock<IPlatformService>();
//         mockPlatform.SetupGet(p => p.Name).Returns("macOS");

//         // Mock IDetectionService and use SetupGet for properties
//         var mockDetection = new Mock<IDetectionService>();
//         mockDetection.SetupGet(s => s.Device).Returns(mockDevice.Object);
//         mockDetection.SetupGet(s => s.Browser).Returns(mockBrowser.Object);
//         mockDetection.SetupGet(s => s.Platform).Returns(mockPlatform.Object);

//         // Create controller with the mocked services
//         var controller = new RedirectionController(db, mockDetection.Object, mockGeo.Object);

//         // You may need to set ControllerBase.HttpContext for Request/Connection info if used in code:
//         controller.ControllerContext = new ControllerContext
//         {
//             HttpContext = new DefaultHttpContext()
//         };

//         // Act
//         var result = await controller.RedirectToOriginalUrl("abc") as OkObjectResult;

//         // Assert
//         Assert.NotNull(result);
//         dynamic body = result.Value!;
//         Assert.Equal("https://example.com", (string)body.url);

//         // verify analytics saved
//         var saved = await db.ClickedAnalytics.FirstOrDefaultAsync(a => a.LinkId == link.Id);
//         Assert.NotNull(saved);
//         Assert.Equal("Desktop", saved.DeviceType);
//         Assert.Equal("macOS", saved.OsName);
//         Assert.Equal("Safari", saved.BrowserName);
//     }
// }