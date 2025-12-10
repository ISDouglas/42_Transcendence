// import { genericFetch } from "../router";
import { GameNetwork, GameState } from "./gameNetwork";

export class GameInstance {
	private role: "player1" | "player2" | null = null;
	private currentState: GameState = {
		ball: { x: 0, y: 0 },
		paddles: { player1: 0, player2: 0 },
		score: { player1: 0, player2: 0 }
	};
	private network: GameNetwork | null = null;
	private localMode: boolean = false;

	setNetwork(network: GameNetwork, role: "player1" | "player2") {
		this.network = network;
		this.role = role;
	}

	applyServerState(state: Partial<GameState>) {
		this.currentState = { ...this.currentState, ...state };
	}

	getCurrentState() {
		return this.currentState;
	}

	sendInput(direction: "up" | "down" | "stop", player?: "player1" | "player2") {
		if (!this.network)
			return;

		if (this.localMode)
		{
			if (!player)
				return;
			this.network.sendInput(direction, player);
		}
		else
		{
			if (!this.role)
				return;
			this.network.sendInput(direction, this.role);
		}
	}

	enableLocalMode() {
		this.localMode = true;
	}

	isLocalMode() {
		return this.localMode;
	}
}
