using Inventra.Api.Configuration;
using Inventra.Api.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using NSubstitute;

namespace Inventra.Api.Tests;

public class HealthControllerTests
{
    private static HealthController Create(MongoDbSettings settings, IMongoDatabase? db, ILogger<HealthController>? logger = null)
    {
        var services = new ServiceCollection();
        if (db is not null) services.AddSingleton(db);
        return new HealthController(
            Options.Create(settings),
            services.BuildServiceProvider(),
            logger ?? NullLogger<HealthController>.Instance);
    }

    // The response is an anonymous type, so read it via reflection.
    private static T Prop<T>(object body, string name) =>
        (T)body.GetType().GetProperty(name)!.GetValue(body)!;

    private static object? RawProp(object body, string name) =>
        body.GetType().GetProperty(name)!.GetValue(body);

    private static object OkBody(IActionResult result)
    {
        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, ok.StatusCode);
        return ok.Value!;
    }

    [Fact]
    public async Task Get_NotConfigured_ReportsNotConfigured_WithoutTouchingMongo()
    {
        var db = Substitute.For<IMongoDatabase>();
        var controller = Create(new MongoDbSettings(), db);

        var body = OkBody(await controller.Get(CancellationToken.None));

        Assert.Equal("ok", Prop<string>(body, "status"));
        Assert.Equal("not_configured", Prop<string>(body, "mongo"));
        Assert.Null(RawProp(body, "mongoDetail"));
        await db.DidNotReceiveWithAnyArgs()
            .RunCommandAsync<BsonDocument>(default!, default, default);
    }

    [Fact]
    public async Task Get_ConfiguredAndPingSucceeds_ReportsOk()
    {
        var db = Substitute.For<IMongoDatabase>();
        db.RunCommandAsync<BsonDocument>(default!, default, default)
            .ReturnsForAnyArgs(Task.FromResult(new BsonDocument("ok", 1)));
        var controller = Create(new MongoDbSettings { ConnectionString = "mongodb://x" }, db);

        var body = OkBody(await controller.Get(CancellationToken.None));

        Assert.Equal("ok", Prop<string>(body, "mongo"));
        Assert.Null(RawProp(body, "mongoDetail"));
    }

    private static bool IsPing(Command<BsonDocument> c) =>
        c is BsonDocumentCommand<BsonDocument> b && b.Document.Contains("ping");

    [Fact]
    public async Task Get_SendsPingCommand()
    {
        var db = Substitute.For<IMongoDatabase>();
        db.RunCommandAsync<BsonDocument>(default!, default, default)
            .ReturnsForAnyArgs(Task.FromResult(new BsonDocument()));
        var controller = Create(new MongoDbSettings { ConnectionString = "mongodb://x" }, db);

        await controller.Get(CancellationToken.None);

        await db.Received(1).RunCommandAsync<BsonDocument>(
            Arg.Is<Command<BsonDocument>>(c => IsPing(c)),
            Arg.Any<ReadPreference>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Get_PingThrows_ReportsUnreachable_AndOnlyExposesExceptionTypeName()
    {
        var db = Substitute.For<IMongoDatabase>();
        db.RunCommandAsync<BsonDocument>(default!, default, default)
            .ReturnsForAnyArgs<Task<BsonDocument>>(_ =>
                throw new TimeoutException("secret-host.mongodb.net user:password"));
        var controller = Create(new MongoDbSettings { ConnectionString = "mongodb://x" }, db);

        var body = OkBody(await controller.Get(CancellationToken.None));

        Assert.Equal("unreachable", Prop<string>(body, "mongo"));
        Assert.Equal("TimeoutException", Prop<string>(body, "mongoDetail"));
        Assert.DoesNotContain("password", body.ToString());
    }

    [Fact]
    public async Task Get_DatabaseCannotBeResolved_ReportsUnreachable()
    {
        // Mirrors Program.cs, where resolving IMongoDatabase throws if the client can't be built.
        var controller = Create(new MongoDbSettings { ConnectionString = "mongodb://x" }, db: null);

        var body = OkBody(await controller.Get(CancellationToken.None));

        Assert.Equal("unreachable", Prop<string>(body, "mongo"));
        Assert.Equal("InvalidOperationException", Prop<string>(body, "mongoDetail"));
    }

    [Fact]
    public async Task Get_PingThrows_LogsWarning()
    {
        var db = Substitute.For<IMongoDatabase>();
        db.RunCommandAsync<BsonDocument>(default!, default, default)
            .ReturnsForAnyArgs<Task<BsonDocument>>(_ => throw new Exception("x"));
        var logger = Substitute.For<ILogger<HealthController>>();
        logger.IsEnabled(Arg.Any<LogLevel>()).Returns(true);
        var controller = Create(new MongoDbSettings { ConnectionString = "mongodb://x" }, db, logger);

        await controller.Get(CancellationToken.None);

        logger.ReceivedWithAnyArgs(1).Log(LogLevel.Warning, default, default!, default, default!);
    }

    [Fact]
    public async Task Get_ForwardsCancellationToken()
    {
        var db = Substitute.For<IMongoDatabase>();
        db.RunCommandAsync<BsonDocument>(default!, default, default)
            .ReturnsForAnyArgs(Task.FromResult(new BsonDocument()));
        var controller = Create(new MongoDbSettings { ConnectionString = "mongodb://x" }, db);
        using var cts = new CancellationTokenSource();

        await controller.Get(cts.Token);

        await db.Received(1).RunCommandAsync<BsonDocument>(
            Arg.Any<Command<BsonDocument>>(), Arg.Any<ReadPreference>(), cts.Token);
    }

    [Fact]
    public async Task Get_IncludesRecentUtcTimestamp()
    {
        var controller = Create(new MongoDbSettings(), null);
        var before = DateTimeOffset.UtcNow;

        var body = OkBody(await controller.Get(CancellationToken.None));

        var ts = Prop<DateTimeOffset>(body, "timestamp");
        Assert.InRange(ts, before, DateTimeOffset.UtcNow);
        Assert.Equal(TimeSpan.Zero, ts.Offset);
    }
}
