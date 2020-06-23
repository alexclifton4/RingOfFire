const socket = io.connect();

// Button to start the game
window.startGame = function() {
    // Tell the server
    socket.emit("start");
};

// Reset button
window.stopGame = function() {
    // Tell the server
    socket.emit("stop")
};

// Receive list of users
socket.on("users", users => {
    // update names list
    let userListText = "";
    Object.keys(users).forEach(user => {
        userListText += users[user].name + "<br>";
    });
    
    // if there are none, say none
    if (userListText == "") {
        userListText = "<i>none</i>"
    }
    
    document.getElementById("userList").innerHTML = userListText;
});

// on load, get list of users
let begin = function() {
  socket.emit("getUsers")
}

window.onload = begin