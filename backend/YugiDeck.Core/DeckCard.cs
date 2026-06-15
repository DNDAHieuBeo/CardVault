namespace YugiDeck.Core.Entities;

public class DeckCard
{
    public int Id { get; set; }
    public int DeckId { get; set; }
    public int CardId { get; set; }
    public string Section { get; set; } = "main"; // main | extra | side
    public Deck Deck { get; set; } = null!;
    public Card Card { get; set; } = null!;
}