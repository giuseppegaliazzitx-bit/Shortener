# Stage 1: build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file from Backend/
COPY Backend/MyApi.csproj ./MyApi.csproj

# Restore dependencies
RUN dotnet restore MyApi.csproj

# Copy the rest of the backend source code
COPY Backend/. .

# Publish the app
RUN dotnet publish -c Release -o /app/publish

# Stage 2: runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "MyApi.dll"]
