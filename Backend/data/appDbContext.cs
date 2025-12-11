// Backend/data/AppDbContext.cs

using Microsoft.EntityFrameworkCore;
using MyApi.Model; // so we can use UserModel, LinkModel, ClickedAnalyticModel

namespace MyApi.Data;
public class AppDbContext : DbContext
{
    // This constructor is used by ASP.NET Core's DI system
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    // These represent your tables in the database
    public DbSet<UserModel> Users => Set<UserModel>();
    public DbSet<LinkModel> Links => Set<LinkModel>();
    public DbSet<ClickedAnalyticModel> ClickedAnalytics => Set<ClickedAnalyticModel>();

}
    /* 
    Optional: further configuration of relationships, constraints, etc.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Example: one User has many Links (if your models already have proper nav props,
        // EF can infer this, but it's nice to be explicit)
        modelBuilder.Entity<UserModel>()
            .HasMany(u => u.Links)
            .WithOne(l => l.User)
            .HasForeignKey(l => l.UserId);

        // Example: one Link has many ClickedAnalytics
        modelBuilder.Entity<LinkModel>()
            .HasMany(l => l.ClickedAnalytics)
            .WithOne(c => c.Link)
            .HasForeignKey(c => c.LinkId);
    }
    */
