using Inventra.Api.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

const string DevCorsPolicy = "DevFrontend";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// MongoDB: clients are created lazily on first use, so a missing or bad
// connection string never prevents the app from starting.
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection(MongoDbSettings.SectionName));
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    if (!settings.IsConfigured)
        throw new InvalidOperationException("MongoDb:ConnectionString is not configured.");

    var mongoSettings = MongoClientSettings.FromConnectionString(settings.ConnectionString);
    mongoSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(5);
    return new MongoClient(mongoSettings);
});
builder.Services.AddSingleton<IMongoDatabase>(sp =>
    sp.GetRequiredService<IMongoClient>()
      .GetDatabase(sp.GetRequiredService<IOptions<MongoDbSettings>>().Value.DatabaseName));

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(o => o.AddPolicy(DevCorsPolicy, p =>
        p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors(DevCorsPolicy);
}

app.UseAuthorization();
app.MapControllers();

app.Run();
