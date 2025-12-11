//Backend/controller/analyticscontroller.cs
using Microsoft.AspNetCore.Mvc;
using MyApi.Data;
using MyApi.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace MyApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // require a valid JWT
    public class AnalyticController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AnalyticController(AppDbContext db)
        {
            _db = db;
        }

        // api/analytic/{linkId}
        [HttpGet("{linkId:int}")]
        public async Task<IActionResult> GetAnalyticsForLink(int linkId)
        {
            //verify jwt and get user id
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized("Invalid user ID in token.");
            }
            
            //find user in database
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            //find link by Id (from route), and also ensure it belongs to the user
            var link = await _db.Links.FirstOrDefaultAsync(l => l.Id == linkId);
            if (link == null)
            {
                return NotFound("Link not found.");
            }
            if (link.UserId != user.Id)
            {
                return Forbid("You do not have permission to view analytics for this link.");
            }

            //get analytics for the link
            var analytics = await _db.ClickedAnalytics
                .Where(ca => ca.LinkId == link.Id)
                .ToListAsync();
            
            var foundLink = await _db.Links.FirstOrDefaultAsync(l => l.Id == linkId);
            
            return Ok(new 
            { 
                Link = foundLink, 
                Analytics = analytics 
            });
        }
    }
}