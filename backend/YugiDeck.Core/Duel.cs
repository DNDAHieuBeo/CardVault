namespace YugiDeck.Core.Entities;

public class Duel
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public string Player1Name { get; set; } = "";
    public string Player2Name { get; set; } = "";
    public int Player1LP { get; set; } = 8000;
    public int Player2LP { get; set; } = 8000;
    public string Status { get; set; } = "active"; // active | ended
    public string? WinnerId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public ICollection<LPLog> LPLogs { get; set; } = [];
}