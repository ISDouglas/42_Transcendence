import { request } from "https";
import { loadHeader } from "../router";

export function DashboardView(): string {
	loadHeader();
	return (document.getElementById("dashboardhtml") as HTMLTemplateElement).innerHTML;
}

export async function initDashboard()
{
	const container = document.getElementById("game-list");
	
	if (!container) 
		return;
    try {
       const response = await fetch(`/api/private/dashboard`, {
								method: "GET"});
								
        const games = await response.json();
		console.log(games);

        container.innerHTML = "";

        games.forEach((game : any) => {
            const item = document.createElement("div") as HTMLDivElement;
            item.classList.add("dash");

            item.innerHTML = `
                <div class="flex justify-between mb-2">
                    <span class="font-semibold">Winner: ${game.winner_id}</span>
                    <span>${new Date(game.date_game).toLocaleDateString()}</span>
                </div>
                <p class="opacity-80">Winner Score: ${game.winner_score}</p>
				<p class="opacity-80">Loser Score: ${game.loser_score}</p>
                <p class="opacity-60">Duration: ${game.duration_game}</p>
            `;

            container.appendChild(item);
        });
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
    }
}
