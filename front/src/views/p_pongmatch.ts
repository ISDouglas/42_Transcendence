import { GameRenderer } from "../game/gameRenderer";
import { GameNetwork } from "../game/gameNetwork";
import { loadHeader } from "../router";
import { GameInstance } from "../game/gameInstance";

let renderer: GameRenderer | null = null;
let net: GameNetwork | null = null;
let currentGame: GameInstance | null = null;

export function PongMatchView(params?: any): string {
	loadHeader();
	return (document.getElementById("pongmatchhtml") as HTMLTemplateElement).innerHTML;
}

export function initPongMatch(params?: any) {
	const gameID: string = params?.id;

	const serverUrl = "https://localhost:3000";

	// 1. Create game for client
	currentGame = new GameInstance();

	// 2. Prepare drawing system
	renderer = new GameRenderer();

	// 3. Connect to server
	net = new GameNetwork(serverUrl, Number(gameID));

	// 4. Join game room
	net.join(Number(gameID));

	// 5. Receive game state from server
	net.onState((state) => {
		if (!currentGame || !renderer)
			return;

		//update local state
		currentGame.applyServerState(state);

		//draw actual state
		renderer.draw(currentGame.getCurrentState());
	});

	// 6. Send inputs to server
	window.addEventListener("keydown", (e) => {
		if (e.key === "w" || e.key === "W")
			currentGame?.sendInput("up");

		if (e.key === "s" || e.key === "S")
			currentGame?.sendInput("down");
	});

	window.addEventListener("keyup", () => {
		currentGame?.sendInput("stop");
	});
}

export function stopGame() {
	net?.disconnect();
	net = null;
	renderer = null;
	currentGame = null;
}
