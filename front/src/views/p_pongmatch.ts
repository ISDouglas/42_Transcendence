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
	const url = new URL(window.location.href);
	const localMode = url.searchParams.get("local") === "1";

	const serverUrl = "https://localhost:3000";

	// 1. Create game for client
	currentGame = new GameInstance();

	// 2. Prepare drawing system
	renderer = new GameRenderer();

	if (localMode)
		currentGame.enableLocalMode();

	// 3. Connect to server
	net = new GameNetwork(serverUrl, Number(gameID));

	//4. set role (player 1 or 2)
	net.onRole((role) => {
		if (net)
			currentGame?.setNetwork(net, role);
	});

	// 5. Join game room
	net.join(Number(gameID));

	// 6. Receive game state from server
	net.onState((state) => {
		if (!currentGame || !renderer)
			return;

		//update local state
		currentGame.applyServerState(state);

		//draw actual state
		renderer.draw(currentGame.getCurrentState());
	});

	// 7. Send inputs to server
	const keyState: { [key: string]: boolean } = {};

	window.addEventListener("keydown", (e) => {
		keyState[e.key] = true;
	});

	window.addEventListener("keyup", (e) => {
		keyState[e.key] = false;
	});

	function updateInput() {
		if (!currentGame)
			return;

		if (currentGame.isLocalMode()) {
			if (keyState["w"] || keyState["W"])
				currentGame.sendInput("up", "player1");
			else if (keyState["s"] || keyState["S"])
				currentGame.sendInput("down", "player1");
			else
				currentGame.sendInput("stop", "player1");

			if (keyState["ArrowUp"])
				currentGame.sendInput("up", "player2");
			else if (keyState["ArrowDown"])
				currentGame.sendInput("down", "player2");
			else
				currentGame.sendInput("stop", "player2");
		}
		else
		{
			if (keyState["w"] || keyState["W"])
				currentGame.sendInput("up");
			else if (keyState["s"] || keyState["S"])
				currentGame.sendInput("down");
			else
				currentGame.sendInput("stop");
		}
	}
	setInterval(updateInput, 16); // ~60 fps
}

export function stopGame() {
	net?.disconnect();
	net = null;
	renderer = null;
	currentGame = null;
}
