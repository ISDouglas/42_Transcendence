import { TournamentState } from "./tournamentNetwork";

export class TournamentInstance {
	private currentState: TournamentState = {
		status: "waiting",
		pseudo: { player1: "", player2: "", player3: "", player4: "" },
		finalists: { player1: "", player2: "" },
		champion: { player: "" }
	};

	applyServerState(state: Partial<TournamentState>) {
		this.currentState = { ...this.currentState, ...state };
	}

	getCurrentState() {
		return this.currentState;
	}
}
