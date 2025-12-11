// Backend/Extension/CorsExtension.cs
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;

namespace MyApi.Extension
{
    public static class CorsExtension
    {
        private const string FrontendPolicyName = "FrontendPolicy";

        public static IServiceCollection AddFrontendCors(this IServiceCollection services, string frontendUrl)
        {
            services.AddCors(options =>
            {
                options.AddPolicy(FrontendPolicyName, policy =>
                {
                    policy
                        .WithOrigins(frontendUrl)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            return services;
        }

        public static IApplicationBuilder UseFrontendCors(this IApplicationBuilder app)
        {
            app.UseCors(FrontendPolicyName);
            return app;
        }
    }
}
