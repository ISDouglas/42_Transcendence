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

declare global {
    interface Window { inputInterval?: NodeJS.Timeout; }
}

export function initPongMatch(params?: any) {
	const gameID: string = params?.id;
	const url = new URL(window.location.href);
	const localMode = url.searchParams.get("local") === "1";

	const serverUrl = window.location.host;

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

	net.onCountdown(() => {
		let countdown = 4;
		let countdownActive = true;
		const interval = setInterval(() => {
			if (!currentGame || !renderer)
				return;
			renderer.drawCountdown(currentGame.getCurrentState(), countdown);
			countdown--;
			if (countdown < 0) {
				clearInterval(interval);
				countdownActive = false;
				if (net)
					net.startMatch();
			}
		}, 1000);
	});

	net.onPredraw((state) => {
		if (!currentGame || !renderer)
			return;

		currentGame.applyServerState(state);

		renderer.draw(currentGame.getCurrentState(), false);
	})

	// 6. Receive game state from server
	net.onState((state) => {
		if (!currentGame || !renderer)
			return;

		//update local state
		currentGame.applyServerState(state);

		//draw actual state
		renderer.draw(currentGame.getCurrentState(), true);
	});

	// 7. Send inputs to server
	const keyState: { [key: string]: boolean } = {};

	window.addEventListener("keydown", (e) => {
		keyState[e.key] = true;
	});

	window.addEventListener("keyup", (e) => {
		keyState[e.key] = false;
	});

	function updateInput()
	{
		if (!currentGame) return;

		if (currentGame.isLocalMode()) {
			let input1: "up" | "down" | "stop" = "stop";
			if (keyState["w"] || keyState["W"])
				input1 = "up";
			else if (keyState["s"] || keyState["S"])
				input1 = "down";
			else
				input1 = "stop";
			currentGame.sendInput(input1, "player1");

			let input2: "up" | "down" | "stop" = "stop";
			if (keyState["ArrowUp"])
				input2 = "up";
			else if (keyState["ArrowDown"])
				input2 = "down";
			else
				input2 = "stop";
			currentGame.sendInput(input2, "player2");
		}
		else {
			let input: "up" | "down" | "stop" = "stop";
			if (keyState["w"] || keyState["W"])
				input = "up";
			else if (keyState["s"] || keyState["S"])
				input = "down";
			else
				input = "stop";

			currentGame.sendInput(input);
		}
	}

	if (window.inputInterval)
		clearInterval(window.inputInterval);
	window.inputInterval = setInterval(updateInput, 16);

}

export function stopGame() {
	net?.disconnect();
	net = null;
	renderer = null;
	currentGame = null;
}
