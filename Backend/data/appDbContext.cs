using Microsoft.EntityFrameworkCore;
using MyApi.Model;

namespace MyApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<UserModel> Users => Set<UserModel>();
    public DbSet<LinkModel> Links => Set<LinkModel>();
    public DbSet<ClickedAnalyticModel> ClickedAnalytics => Set<ClickedAnalyticModel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Users table
        modelBuilder.Entity<UserModel>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Username).HasColumnName("username").IsRequired();
            e.Property(x => x.Email).HasColumnName("email").IsRequired();
            e.Property(x => x.HashedPassword).HasColumnName("hashed_password").IsRequired();
            e.Property(x => x.UserPfpUrl).HasColumnName("user_pfp_url");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
        });

        // Links table
        modelBuilder.Entity<LinkModel>(e =>
        {
            e.ToTable("links");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.OriginalUrl).HasColumnName("original_url").IsRequired();
            e.Property(x => x.Slug).HasColumnName("slug").IsRequired();
            e.Property(x => x.TotalClicks).HasColumnName("total_clicks");
            e.Property(x => x.CreatedOn).HasColumnName("created_on");
            e.Property(x => x.LastClickedOn).HasColumnName("last_clicked_on");
            e.Property(x => x.UserId).HasColumnName("user_id");

            // Relationship: Link -> User
            e.HasOne(x => x.User)           // References property 'User' in LinkModel
             .WithMany(u => u.Links)        // References property 'Links' in UserModel
             .HasForeignKey(x => x.UserId)  // Explicitly uses 'UserId' column
             .HasConstraintName("fk_links_user_id")
             .OnDelete(DeleteBehavior.Cascade); // Delete links if user is deleted
        });

        // ClickedAnalytics table
        modelBuilder.Entity<ClickedAnalyticModel>(e =>
        {
            e.ToTable("clicked_analytics");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.ClickedOn).HasColumnName("clicked_on");
            e.Property(x => x.Continent).HasColumnName("continent");
            e.Property(x => x.CountryCode).HasColumnName("country_code");
            e.Property(x => x.DeviceType).HasColumnName("device_type");
            e.Property(x => x.OsName).HasColumnName("os_name");
            e.Property(x => x.BrowserName).HasColumnName("browser_name");
            e.Property(x => x.LinkId).HasColumnName("link_id");

            // Relationship: ClickedAnalytic -> Link
            e.HasOne(x => x.Link)                   // References property 'Link' in ClickedAnalyticModel
             .WithMany(l => l.ClickedAnalytics)      // References property 'ClickedAnalytics' in LinkModel
             .HasForeignKey(x => x.LinkId)          // Explicitly uses 'LinkId' column
             .HasConstraintName("fk_clicked_analytics_link_id")
             .OnDelete(DeleteBehavior.Cascade);     // Delete analytics if link is deleted
        });
    }
}
