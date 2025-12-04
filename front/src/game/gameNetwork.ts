import { io, Socket } from "socket.io-client";

export interface ServerGameState {
	ball: { x: number; y: number };
	paddles: { player1: number; player2: number };
	score: { player1: number; player2: number };
}

export class GameNetwork {
	private socket: Socket;
	private onStateCallback?: (state: ServerGameState) => void;

	constructor(serverUrl: string, gameId: number) {
		this.socket = io(serverUrl, { transports: ["websocket"] });

		this.socket.on("connect", () => {
			this.socket.emit("joinGame", gameId);
		});

		this.socket.on("state", (state: ServerGameState) => {
			this.onStateCallback?.(state);
		});
	}

	onState(cb: (state: ServerGameState) => void) {
		this.onStateCallback = cb;
	}

	sendInput(direction: "up" | "down" | "stop") {
		this.socket.emit("input", { direction });
	}

	join(gameId: number) {
		this.socket.emit("joinGame", gameId);
	}

	disconnect() {
		this.socket.disconnect();
	}

	public getSocket(): Socket {
		return this.socket;
	}
}
