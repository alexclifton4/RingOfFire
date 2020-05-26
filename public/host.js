const socket = io.connect();

// Button to start the game
window.startGame = function() {
    // Tell the server
    socket.emit("start");
};

// Reset buttn
window.stopGame = function() {
    // Tell the server
    socket.emit("stop")
};