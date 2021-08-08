const io = require("socket.io");

let socketsManager;
let clients = [];

function start(listener) {
    socketsManager = io(listener, {cors: { origin: "http://localhost:3000" } });

    socketsManager.sockets.on("connection", socket => {
        clients.push(socket.id);
        
        socket.on("disconnect", () => {
            const index = clients.findIndex(index => index.id === socket.id);
            clients.splice(index, 1);
            console.log("One client has been disconnected");
        });
        socketsManager.sockets.emit("send-player-id-from-server", clients);

        socket.on("send-selection-from-client", selection => {
            socketsManager.sockets.emit("send-selection-from-server", selection);
        });

        socket.on("send-winner-from-client", winner => {
            socketsManager.sockets.emit("send-winner-from-server", winner);
        });
    });
}

module.exports = {
    start
}