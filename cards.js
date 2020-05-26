const fullDeck = ["Ace of Hearts", "2 of Hearts", "3 of Hearts", "4 of Hearts", "5 of Hearts", "6 of Hearts", "7 of Hearts", "8 of Hearts", "9 of Hearts", "10 of Hearts", "Jack of Hearts", "Queen of Hearts", "King of Hearts","Ace of Diamonds", "2 of Diamonds", "3 of Diamonds", "4 of Diamonds", "5 of Diamonds", "6 of Diamonds", "7 of Diamonds", "8 of Diamonds", "9 of Diamonds", "10 of Diamonds", "Jack of Diamonds", "Queen of Diamonds", "King of Diamonds","Ace of Spades", "2 of Spades", "3 of Spades", "4 of Spades", "5 of Spades", "6 of Spades", "7 of Spades", "8 of Spades", "9 of Spades", "10 of Spades", "Jack of Spades", "Queen of Spades", "King of Spades","Ace of Clubs", "2 of Clubs", "3 of Clubs", "4 of Clubs", "5 of Clubs", "6 of Clubs", "7 of Clubs", "8 of Clubs", "9 of Clubs", "10 of Clubs", "Jack of Clubs", "Queen of Clubs", "King of Clubs"]

const rules = {
    Ace: "Waterfall",
    2: "You",
    3: "Me",
    4: "Whores",
    5: "Thumbmaster",
    6: "Dicks",
    7: "Heaven",
    8: "Mate",
    9: "Rhyme",
    10: "Categories",
    Jack: "The player is entering a rule...",
    Queen: "Question Master",
    King: "This text should not be displayed (Something's gone wrong....)"
}

exports.shuffleDeck = function() {
    // Shuffle the deck
    let deck = fullDeck.slice();
    let m = deck.length
    
    while (m) {
        // Pick a random element
        let i = Math.floor(Math.random() * m--);
        
        // Swap with the current element
        let t = deck[m];
        deck[m] = deck[i];
        deck[i] = t;
    }
    
    return deck;
}

exports.getRule = function(card) {
    // Just use the first word
    card = card.split(" ")[0];
    return rules[card];
}