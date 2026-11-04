using Inventra.Api.Configuration;

namespace Inventra.Api.Tests;

public class MongoDbSettingsTests
{
    [Fact]
    public void Defaults_AreNotConfigured_AndUseInventraDatabase()
    {
        var s = new MongoDbSettings();
        Assert.False(s.IsConfigured);
        Assert.Equal("inventra", s.DatabaseName);
        Assert.Equal("MongoDb", MongoDbSettings.SectionName);
    }

    [Theory]
    [InlineData("", false)]
    [InlineData("   ", false)]
    [InlineData("mongodb://localhost:27017", true)]
    public void IsConfigured_DependsOnConnectionString(string cs, bool expected)
    {
        Assert.Equal(expected, new MongoDbSettings { ConnectionString = cs }.IsConfigured);
    }
}
