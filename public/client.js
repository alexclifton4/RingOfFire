const socket = io.connect();

let loggedIn = false;
let loggingIn = false;
let name = "";
let yourGo = false;
let canPick = true;
let mostRecent = "";

// When login button is pressed
window.join = function() {
    document.getElementById("login").style.display = "none";
    document.getElementById("loading").style.display = "block";

    name = document.getElementById("loginName").value;
    socket.emit("login", name);
    loggingIn = true;
};

// Can't join because of an error
socket.on("cantJoin", reason => {
    alert("You can't join because " + reason)
    document.getElementById("login").style.display = "block";
    document.getElementById("loading").style.display = "none";
})

// When a new user joins
socket.on("users", users => {
    // See if logging in
    if (loggingIn) {
        // Switch to main mode
        document.getElementById("loading").style.display = "none";
        document.getElementById("main").style.display = "block";
        loggedIn = true;
        loggingIn = false;
    }
    // If logged in, update names list
    // Note, this kinda falls through from last if statement
    if (loggedIn) {
        let userListText = "";
        Object.keys(users).forEach(user => {
            userListText += users[user].name + "<br>";
        });
        document.getElementById("userList").innerHTML = userListText;
    }
});

// When the game starts
socket.on("gameStart", data => {
    // Change state display
    document.getElementById("gameState").innerHTML = ""
})

// Whenever game state changes
socket.on("stateUpdate", state => {
    document.getElementById("currentPlayer").innerHTML = state.currentPlayer;
    document.getElementById("jackRules").innerHTML = state.extraRules;
    document.getElementById("kings").innerHTML = state.kingCount + " out of 4"
    drawCards(state.displayCards);
    
    // See if its the player's go
    if (name === state.currentPlayer) {
        document.getElementById("yourGo").style.display = "block"
        yourGo = true;
    } else {
        document.getElementById("yourGo").style.display = "none"
        yourGo = false;
    }
});

// When a card is picked
socket.on("presentCard", data => {
    // Show the message
    let text = `<h1>${data.person} picked ${data.name}</h1>`
    
    // If its players go and its a jack, ask for a rule
    if (yourGo && data.name.split(" ")[0] === "Jack") {
        let newRule = prompt("You picked a Jack! Enter a new rule");
        text += `<p>You created a new rule: ${newRule}</p>`
        // Tell the server
        socket.emit("newRule", newRule);
    } else {
        text += `<p>${data.description}</p>`
    }
    
    // Add a button if its the players go
    if (yourGo) {
        text += '<button onclick="nextRound()">Move to next round</button>'
    }
    
    let el = document.getElementById("message");
    el.innerHTML = text;
    el.style.display = "block"
    
    mostRecent = `${data.person} picked ${data.name}`
});

// Moving onto the next round so close the message
socket.on("closeMessage", data => {
    document.getElementById("message").style.display = "none"
    
    // Also change last round text
    document.getElementById("lastRound").innerHTML = mostRecent;
    
    canPick = true;
})

// Kicked out
socket.on("kicked", data => {
    alert("You have been disconnected by the host")
    location.reload();
})

// Draws the table of cards
const drawCards = function(cards) {
    let table = "<h2>Cards</h2>"
    table += "<table>";
    
    let index = 0;
    // 13 rows of cards
    for (let y = 0; y < 13; y++) {
        table += "<tr>"
        // Add four cards to the row
        for (let x = 0; x < 4; x++) {
            if (cards[index]) {
                table += `<td onclick="cardPicked(${index})" class="notPicked"></td>`
                index++;
            } else {
                table += "<td></td>"
                index++;
            }
        }
        table += "</tr>"
    };
    
    table += "</table>";
    
    document.getElementById("cards").innerHTML = table;
};

// When the player picks a card
window.cardPicked = function(index) {
    // If its the player's go, tell the server
    if (yourGo && canPick) {
        socket.emit("cardPicked", index);
        canPick = false;
    }
}

// Tells the server to move on to the next round
window.nextRound = function() {
    socket.emit("nextRound");
}