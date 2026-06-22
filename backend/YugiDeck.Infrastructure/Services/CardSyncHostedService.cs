using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using YugiDeck.Core.Interfaces;

namespace YugiDeck.Infrastructure.Services;

public class CardSyncHostedService(
    IServiceScopeFactory scopeFactory,
    ILogger<CardSyncHostedService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Run once immediately on startup, then every 24h
        await RunSync(stoppingToken);

        using var timer = new PeriodicTimer(Interval);
        while (await timer.WaitForNextTickAsync(stoppingToken))
            await RunSync(stoppingToken);
    }

    private async Task RunSync(CancellationToken ct)
    {
        try
        {
            logger.LogInformation("Scheduled card sync starting...");
            using var scope = scopeFactory.CreateScope();
            var cardService = scope.ServiceProvider.GetRequiredService<ICardService>();
            var count = await cardService.SyncFromYgoApiAsync();
            logger.LogInformation("Scheduled card sync complete: {Count} cards processed.", count);
        }
        catch (OperationCanceledException) { /* shutting down */ }
        catch (Exception ex)
        {
            logger.LogError(ex, "Scheduled card sync failed.");
        }
    }
}
