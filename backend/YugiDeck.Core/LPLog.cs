namespace YugiDeck.Core.Entities;

public class LPLog
{
    public int Id { get; set; }
    public int DuelId { get; set; }
    public int PlayerNumber { get; set; } // 1 hoặc 2
    public int Delta { get; set; }        // âm = trừ, dương = cộng
    public int NewValue { get; set; }
    public DateTime Timestamp { get; set; }
    public Duel Duel { get; set; } = null!;
}