namespace YugiDeck.Core.Entities;

public class UserCard
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public int CardId { get; set; }
    public int Quantity { get; set; }
    public Card Card { get; set; } = null!;
}