namespace Inventra.Api.Configuration;

/// <summary>Bound from the "MongoDb" configuration section.</summary>
public class MongoDbSettings
{
    public const string SectionName = "MongoDb";

    /// <summary>Atlas connection string. Set via user-secrets or environment, never in source control.</summary>
    public string ConnectionString { get; set; } = string.Empty;

    public string DatabaseName { get; set; } = "inventra";

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ConnectionString);
}
