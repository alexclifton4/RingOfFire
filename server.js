const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const cards = require("./cards.js");

let users = {};
let userIds = [];
let playing = false;
let deck;
let state = {
    currentPlayerId: 0,
    currentPlayer: "",
    displayCards: [],
    extraRules: "No Jacks picked yet",
    kingCount: 0
}

app.use(express.static('public'));

app.get("/host", (req, res) => {
   res.sendFile(__dirname + "/host.html"); 
});

app.get("*", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
    // New user connected
    socket.on("login", (name) => {
        // Can't connect if game has started
        if (playing) {
            socket.emit("cantJoin", "the game has already started.");
        }
        
        // Can't connect if the name is taken
        else if (nameTaken(name)) {
            socket.emit("cantJoin", `the name "${name}"  is already taken.`);
        } else {
        
            console.log(name + " joined");
            users[socket.id] = {};
            users[socket.id].name = name;
            userIds.push(socket.id);
            io.emit("users", users);
        }
    });

    // User left
    socket.on("disconnect", (data) => {
        if (users[socket.id]) {
            console.log(users[socket.id].name + " left");
            delete users[socket.id];
            userIds.splice(userIds.indexOf(socket.id), 1);
            io.emit("users", users);
        }
    });
    
    // request for an updated user list
    socket.on("getUsers", data => {
      io.emit("users", users)
    })

    // Start game button pressed
    socket.on("start", (data) => {
        // Make sure there are players
        if (userIds.length != 0) {
            console.log("Game started");
            io.emit("gameStart");
            
            // Create a new deck and set first player
            deck = cards.shuffleDeck();
            state.currentPlayerId = 0;
            state.currentPlayer = users[userIds[state.currentPlayerId]].name;
            state.extraRules = "No Jacks picked yet";
            state.kingCount = 0;
            
            // Set all display cards
            for (let i = 0; i < 52; i++) {
                state.displayCards[i] = true;
            }
            
            // Send to clients
            io.emit("stateUpdate", state);
            playing = true;
        }
    })
    
    // Stop game button pressed
    socket.on("stop", data => {
        playing = false
        console.log("Game stopped")
        io.emit("kicked")
    })
    
    // When a card is picked
    socket.on("cardPicked", (index) => {
        // Remove the display card
        state.displayCards[index] = false;
        
        let card = deck.pop();
        let description = cards.getRule(card)
        
        // Deal with king
        if (card.split(" ")[0] === "King") {
            state.kingCount++;
            description = "King's Cup!!!<br>"
            if (state.kingCount == 4) {
                description += "That was the final king!!!"
            } else {
                description += state.kingCount + " kings picked so far";
            }
        }
        
        io.emit("stateUpdate", state);
        
        io.emit("presentCard", {person: users[socket.id].name, name: card, description: description})
    });
    
    // Move on to the next round
    socket.on("nextRound", data => {
        // Update state
        state.currentPlayerId = (state.currentPlayerId + 1) % userIds.length;
        state.currentPlayer = users[userIds[state.currentPlayerId]].name;
        io.emit("stateUpdate", state);
        
        // Also tell clients to hide message
        io.emit("closeMessage");
    });
    
    // A new rule has been created from a Jack
    socket.on("newRule", newRule => {
        if (state.extraRules == "No Jacks picked yet") {
            state.extraRules = ""
        }
        
        // Add to list and broadcast
        state.extraRules += newRule + "<br>"
        io.emit("stateUpdate", state);
    })
});

const nameTaken = function(name) {
    // Loop through each player
    let taken = false
    Object.keys(users).forEach(key => {
        if (users[key].name === name) {
            taken = true;
        }
    })
    
    return taken;
}

const port = process.env.PORT || 80;
server.listen(port, () => {
    console.log("Listening on port " + port);
})