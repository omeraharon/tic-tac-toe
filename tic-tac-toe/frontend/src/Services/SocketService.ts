import {io, Socket} from "socket.io-client";
import { BoxModel } from "../Models/BoxModel";

class SocketService {
    public socket: Socket;

    public connect() {
        this.socket = io("http://localhost:3001");
    }

    public disconnect() {
        this.socket.disconnect();
    }

    public send(gameArr: BoxModel[]) {
        this.socket.emit("send-selection-from-client", gameArr);
    }

    public sendWinner(winner: any) {
        this.socket.emit("send-winner-from-client", winner);
    }
}

export default SocketService;