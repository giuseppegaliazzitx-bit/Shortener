using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MyApi.Data;
using MyApi.Model;
using System.IdentityModel.Tokens.Jwt;


namespace MyApi.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // require a valid JWT
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ProfileController(AppDbContext db)
        {
            _db = db;
        }

        // GET api/profile
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            // Get the "sub" claim (subject = user id)
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // alternative (same thing): User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized(new {message= "User ID (sub) claim not found in token."});
            }

            if (!int.TryParse(userIdString, out var userId))
            {
                return Unauthorized("Invalid user ID in token.");
            }

            // Now userId is an int, use it to query your DB
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            var result = new
            {
                user.Id,
                user.UserPfpUrl,
                user.Username,
                user.Email,
                user.CreatedAt
            };

            return Ok(result);
        }

        // PATCH api/profile/updateUser
        [HttpPatch("updateUser")]
        public async Task<IActionResult> updateUser([FromBody] UpdateUserRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized("Invalid user ID in token.");
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.Password) && BCrypt.Net.BCrypt.Verify(request.Password, user.HashedPassword))
            {
                if (!string.IsNullOrEmpty(request.Username))
                {
                    user.Username = request.Username;
                }

                if (!string.IsNullOrEmpty(request.UserPfpUrl))
                {
                    user.UserPfpUrl = request.UserPfpUrl;
                }

                if (!string.IsNullOrEmpty(request.Email))
                {
                    user.Email = request.Email;
                }

                if (!string.IsNullOrEmpty(request.NewPassword))
                {
                    user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
                }
            }
            else
            {
                return BadRequest("Password is required and must be correct to update profile.");
            }
            await _db.SaveChangesAsync();
            return Ok(new { message = "User updated successfully." });
        }

        //DELETE api/profile/deleteUser
        [HttpDelete("deleteUser")]
        public async Task<IActionResult> DeleteUser([FromBody] DeleteUserRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if(string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized("Invalid user ID in token.");
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound("User not found.");

            if (string.IsNullOrEmpty(request?.Password) || !BCrypt.Net.BCrypt.Verify(request.Password, user.HashedPassword))
                return BadRequest("Password is required and must be correct to delete account.");

            // Start transaction
            await using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                // 1) Get link ids for the user
                var linkIds = await _db.Links
                    .Where(l => l.UserId == userId)
                    .Select(l => l.Id)
                    .ToListAsync();

                if (linkIds.Any())
                {
                    // 2) Delete ClickedAnalytics that reference those links
                    // Use parameterized raw SQL to delete in DB efficiently
                    await _db.Database.ExecuteSqlRawAsync(
                        "DELETE FROM \"ClickedAnalytics\" WHERE \"LinkId\" = ANY({0})", new object[] { linkIds });

                    // 3) Delete Links
                    await _db.Database.ExecuteSqlRawAsync(
                        "DELETE FROM \"Links\" WHERE \"Id\" = ANY({0})", new object[] { linkIds });
                }

                // 4) Finally delete the user
                await _db.Database.ExecuteSqlRawAsync(
                    "DELETE FROM \"Users\" WHERE \"Id\" = {0}", new object[] { userId });

                await tx.CommitAsync();
                return Ok(new { message = "User and related data deleted." });
            }
            catch (DbUpdateException dbEx)
            {
                await tx.RollbackAsync();
                // TODO: log dbEx
                return StatusCode(500, "Database error while deleting user and related data.");
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                // TODO: log ex
                return StatusCode(500, "Unexpected error while deleting user and related data.");
            }

        }
    }
}
