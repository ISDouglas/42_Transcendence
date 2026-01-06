import { io, Socket } from "socket.io-client";

export class TournamentNetwork {
	private socket: Socket;
	private onStateCallback?: (idPlayers: number[], pseudoPlayers: string[]) => void;

	private onDisconnectionCallback?: () => void;

	constructor(serverUrl: string, tournamentId: number) {
		this.socket = io(serverUrl, { transports: ["websocket"] });

		this.socket.on("connect", () => {
			this.socket.emit("joinTournament", tournamentId);
		});

		this.socket.on("tournamentPlayersUpdate", (idPlayers: number[], pseudoPlayers: string[]) => {
			this.onStateCallback?.(idPlayers, pseudoPlayers);
		});


		this.socket.on("disconnection", () => {
			this.onDisconnectionCallback?.();
		});
	}

	onState(cb: (idPlayers: number[], pseudoPlayers: string[]) => void) {
		this.onStateCallback = cb;
	}

	onDisconnection(cb: () => void) {
		this.onDisconnectionCallback = cb;
	}

	startGame() {
		this.socket.emit("startGame");
	}

	join(gameId: number, playerId: number) {
		this.socket.emit("joinTournament", gameId, playerId);
	}

	disconnect() {
		this.socket.emit("disconnection");
		this.socket.disconnect();
	}
}
