using Inventra.Api.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Inventra.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController(
    IOptions<MongoDbSettings> mongoOptions,
    IServiceProvider services,
    ILogger<HealthController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        string mongo;
        string? detail = null;

        if (!mongoOptions.Value.IsConfigured)
        {
            mongo = "not_configured";
        }
        else
        {
            try
            {
                var db = services.GetRequiredService<IMongoDatabase>();
                await db.RunCommandAsync<BsonDocument>(new BsonDocument("ping", 1), cancellationToken: ct);
                mongo = "ok";
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "MongoDB ping failed");
                mongo = "unreachable";
                detail = ex.GetType().Name; // avoid leaking connection details
            }
        }

        return Ok(new { status = "ok", timestamp = DateTimeOffset.UtcNow, mongo, mongoDetail = detail });
    }
}
