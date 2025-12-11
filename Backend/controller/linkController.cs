//Backend/controller/linkController.cs
using Microsoft.AspNetCore.Mvc;
using MyApi.Data;
using MyApi.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.FileSystemGlobbing.Internal.PathSegments;

namespace MyApi.Controller
{
[ApiController]
[Route("api/[controller]")]
[Authorize] // require a valid JWT
public class LinkController : ControllerBase
    {
        private readonly AppDbContext _db;

        public LinkController(AppDbContext db)
        {
            _db = db;
        }

        // POST api/link/create
        [HttpPost("create")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateShortenedLink([FromBody] CreateLinkRequest request)
        {
            

            // Try to get user from JWT (if present). If no token, userId stays null
            int? userId = null;
            var debugId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(debugId, out int parsedId))
            {
                userId = parsedId;
            }
            // Validate OriginalUrl
            if (string.IsNullOrWhiteSpace(request.OriginalUrl))
            {
                return BadRequest("OriginalUrl is required.");
            }

            LinkModel newLink;

            // If custom slug is provided
            if (!string.IsNullOrEmpty(request.CustomSlug))
            {
                var existingLink = await _db.Links.FirstOrDefaultAsync(l => l.Slug == request.CustomSlug);
                if (existingLink != null)
                {
                    return Conflict(new { message = "Custom slug is already in use." });
                }

                newLink = new LinkModel
                {
                    OriginalUrl = request.OriginalUrl,
                    Slug = request.CustomSlug,
                    TotalClicks = 0,
                    CreatedOn = DateTime.UtcNow,
                    LastClickedOn = null,
                    UserId = userId // may be null (anonymous)
                };
            }
            else
            {
                // Generate random slug
                var slug = NanoidDotNet.Nanoid.Generate(size: 8);

                newLink = new LinkModel
                {
                    OriginalUrl = request.OriginalUrl,
                    Slug = slug,
                    TotalClicks = 0,
                    CreatedOn = DateTime.UtcNow,
                    LastClickedOn = null,
                    UserId = userId // may be null (anonymous)
                };
            }

            _db.Links.Add(newLink);
            await _db.SaveChangesAsync();

            // Return slug so frontend can build short URL
            return Ok(new
            {
                message = "Shortened URL created successfully.",
                data = newLink,
                slug = newLink.Slug,
                originalUrl = newLink.OriginalUrl
            });
        }

        // PATCH /api/link/edit/{linkId}
        [HttpPatch("edit/{linkId:int}")]
        public async Task<IActionResult> EditSlug(int linkId, [FromBody] EditSlugRequest request)
        {
            // verify jwt and get user id
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized("Invalid user ID in token.");
            }

            // find user in database using userId
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            // check if linkId (from route) exists
            var link = await _db.Links.FirstOrDefaultAsync(l => l.Id == linkId);
            if (link == null)
            {
                return NotFound(new {message="Link not found."});
            }

            // check if link belongs to user
            if (link.UserId != user.Id)
            {
                return StatusCode(403, new { message = "You do not have permission to edit this link." });
            }

            // optionally validate request.NewSlug not null/empty
            if (string.IsNullOrWhiteSpace(request.NewSlug))
            {
                return BadRequest(new { message ="New slug is required."});
            }

            // check if new slug is already in use
            var existingLink = await _db.Links.FirstOrDefaultAsync(l => l.Slug == request.NewSlug);
            if (existingLink != null && existingLink.Id != link.Id)
            {
                return Conflict(new { message = "The new slug is already in use. Please write something else" });
            }


            // update slug
            link.Slug = request.NewSlug;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Slug updated successfully." });
        }

        // api/link/delete
        // api/link/delete/{linkId}
        [HttpDelete("delete/{linkId:int}")]
        public async Task<IActionResult> DeleteLink(int linkId)
        {
            // verify jwt and get user id
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized("Invalid user ID in token.");
            }

            // find user in database using userId
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            // find link by Id (from route), and also ensure it belongs to the user
            var link = await _db.Links.FirstOrDefaultAsync(l => l.Id == linkId);
            if (link == null)
            {
                return NotFound("Link not found.");
            }
            
            if (link.UserId != user.Id)
            {
                return Forbid("You do not have permission to delete this link.");
            }

            // delete link
            _db.Links.Remove(link);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Link deleted successfully." });
        }


        // api/link/getLinks
        [HttpGet("getLinks")]
        public async Task<IActionResult> GetUserLinks()
        {
            // verify jwt and get user id
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized("Invalid user ID in token.");
            }

            // find user in database using userId
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            // retrieve links for the user
            var links = await _db.Links
                .Where(l => l.UserId == user.Id)
                .OrderByDescending(l => l.CreatedOn) 
                .Select(l => new
                {
                    l.Id,
                    l.OriginalUrl,
                    l.Slug,
                    l.TotalClicks,
                    l.CreatedOn,
                    l.LastClickedOn
                })
                .ToListAsync();
            return Ok(links);
        }
    }
}

