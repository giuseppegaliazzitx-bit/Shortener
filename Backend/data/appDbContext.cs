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
            e.Property(x => x.Username).HasColumnName("username");
            e.Property(x => x.Email).HasColumnName("email");
            e.Property(x => x.HashedPassword).HasColumnName("hashed_password");
            e.Property(x => x.UserPfpUrl).HasColumnName("user_pfp_url");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            // add other UserModel properties here...
        });

        // Links table
        modelBuilder.Entity<LinkModel>(e =>
        {
            e.ToTable("links");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.OriginalUrl).HasColumnName("original_url");
            e.Property(x => x.Slug).HasColumnName("slug");
            e.Property(x => x.TotalClicks).HasColumnName("total_clicks");
            e.Property(x => x.CreatedOn).HasColumnName("created_on");
            e.Property(x => x.LastClickedOn).HasColumnName("last_clicked_on");
            e.Property(x => x.UserId).HasColumnName("user_id");

            // Relationship: Link -> User (optional; requires navigation properties in models)
            e.HasOne<UserModel>()
             .WithMany()
             .HasForeignKey(x => x.UserId)
             .HasConstraintName("fk_links_user_id");
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
            // add other ClickedAnalyticModel properties here...

            // Relationship: ClickedAnalytic -> Link (optional)
            e.HasOne<LinkModel>()
             .WithMany()
             .HasForeignKey(x => x.LinkId)
             .HasConstraintName("fk_clicked_analytics_link_id");
        });
    }
}
