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
            e.Property(x => x.PasswordHash).HasColumnName("password_hash");
            // add other UserModel properties here...
        });

        // Links table
        modelBuilder.Entity<LinkModel>(e =>
        {
            e.ToTable("links");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.CreatedOn).HasColumnName("created_on");
            e.Property(x => x.LastClickedOn).HasColumnName("last_clicked_on");
            e.Property(x => x.OriginalUrl).HasColumnName("original_url");
            e.Property(x => x.Slug).HasColumnName("slug");
            e.Property(x => x.TotalClicks).HasColumnName("total_clicks");
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
            e.Property(x => x.LinkId).HasColumnName("link_id");
            e.Property(x => x.ClickedOn).HasColumnName("clicked_on");
            e.Property(x => x.IpAddress).HasColumnName("ip_address");
            e.Property(x => x.Country).HasColumnName("country");
            e.Property(x => x.City).HasColumnName("city");
            e.Property(x => x.UserAgent).HasColumnName("user_agent");
            // add other ClickedAnalyticModel properties here...

            // Relationship: ClickedAnalytic -> Link (optional)
            e.HasOne<LinkModel>()
             .WithMany()
             .HasForeignKey(x => x.LinkId)
             .HasConstraintName("fk_clicked_analytics_link_id");
        });
    }
}
