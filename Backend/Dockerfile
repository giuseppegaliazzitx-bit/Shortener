# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file that actually exists in Backend/
COPY MyApi.csproj ./

# Restore dependencies
RUN dotnet restore

# Copy the rest of the backend source code
COPY . .

# Publish the app
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# App listens on port 8000
ENV ASPNETCORE_URLS=http://0.0.0.0:8000
EXPOSE 8000

ENTRYPOINT ["dotnet", "MyApi.dll"]
