import { navigateTo, genericFetch, loadHeader } from "../router";
import { TournamentNetwork } from "../tournament/tournamentNetwork";

let net: TournamentNetwork | null = null;

export function BracketsView(): string {
	loadHeader();
	return (document.getElementById("bracketshtml") as HTMLTemplateElement).innerHTML;
}

export async function initBrackets(params?: any) {
	const tournamentID: string = params?.id;
	const pseudoP1 = document.getElementById("player1-name");
	const pseudoP2 = document.getElementById("player2-name");
	const pseudoP3 = document.getElementById("player3-name");
	const pseudoP4 = document.getElementById("player4-name");
	const pseudos = [
		pseudoP1, pseudoP2, pseudoP3, pseudoP4
	];

	const id = await genericFetch("/api/private/game/playerinfo");

	const serverUrl = window.location.host;

	net = new TournamentNetwork(serverUrl, Number(tournamentID));

	net.join(Number(tournamentID), Number(id.playerId));

	net.onState((idPlayers: number[], pseudoPlayers: string[]) => {
		updateBrackets(idPlayers, pseudoPlayers);
	});

	async function updateBrackets(idPlayers: number[], pseudoPlayers: string[]) {
		for (let i = 0; i < 4; i++) {
			const pseudo = pseudos[i];
			console.log("pseudo front : ", pseudoPlayers[i]);
			const playerId = Number(idPlayers[i]);

			if (!pseudo) continue;

			if (playerId === 1) {
				pseudo.innerText = "Waiting for player...";
			} else {
				pseudo.innerText = pseudoPlayers[i];
			}
		}
	}
}

export function stopTournament()
{
	net?.disconnect();
	net = null;
}
