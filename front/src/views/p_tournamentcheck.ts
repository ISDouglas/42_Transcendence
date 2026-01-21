import { navigateTo, genericFetch } from "../router";
import { showToast } from "./show_toast";

export function TournamentCheckView(): string {
    const template = document.getElementById("tournamentcheckhtml") as HTMLTemplateElement;
    setTimeout(() => initTournamentCheckPage(), 0);
    return template.innerHTML;
}

// ===================== Events =====================
async function initTournamentCheckPage() {
    await showDBOnChain();

    const backBtn = document.getElementById("back-to-tournament");
    backBtn?.addEventListener("click", () => navigateTo("/tournament"));

    // Database
    const dbSearchInput = document.getElementById("db-search") as HTMLInputElement;
    const dbShowAll = document.getElementById("db-show-all");
    const dbShowOnchain = document.getElementById("db-show-onchain");

    dbSearchInput?.addEventListener("input", () => {
        const query = dbSearchInput.value.trim().toLowerCase();
        filterTournaments("db-panel", query);
    });
    dbShowAll?.addEventListener("click", () => filterTournaments("db-panel", "last8"));
    dbShowOnchain?.addEventListener("click", () => filterTournaments("db-panel", "last8-onchain"));

    // Blockchain
    const chainSearchInput = document.getElementById("chain-search") as HTMLInputElement;
    const chainShowAll = document.getElementById("chain-show-all");

    chainSearchInput?.addEventListener("input", () => {
        const query = chainSearchInput.value.trim().toLowerCase();
        filterTournaments("chain-panel", query);
    });
    chainShowAll?.addEventListener("click", () => filterTournaments("chain-panel", "last8"));
}

// ===================== Show DB vs Blockchain =====================
function formatRanking(ranking: number[], userMap: Record<number, any>, isBlockchain = false): string {
    return `
        <ul class="mt-2 divide-y divide-slate-200 dark:divide-slate-700">
            ${ranking.map((id, index) => {
                if (isBlockchain && id === 0) return "";
                if (id === -1) return `
                    <li class="flex items-center gap-3 py-2 text-slate-500 italic">
                        <span class="w-6 text-right text-xs font-semibold">#${index + 1}</span>
                        <span>🤖 AI</span>
                    </li>`;
                const u = userMap[id];
                if (!u) return `
                    <li class="flex items-center gap-3 py-2 text-red-600 italic">
                        <span class="w-6 text-right text-xs font-semibold">#${index + 1}</span>
                        <span>UserNotExistInDB (#${id})</span>
                    </li>`;
                return `
                    <li class="flex items-center gap-3 py-2">
                        <span class="w-6 text-right text-xs font-semibold text-slate-500">#${index + 1}</span>
                        <img src="${u.avatar}" class="h-7 w-7 rounded-full border border-slate-300 dark:border-slate-600" />
                        <div class="flex flex-col leading-tight">
                            <span class="text-sm font-medium text-slate-800 dark:text-slate-100">${u.pseudo}</span>
                            <span class="text-xs text-slate-400">#${u.user_id}</span>
                        </div>
                    </li>`;
            }).join("")}
        </ul>
    `;
}

const MAX_SHOW = 8;

async function showDBOnChain() {
    try {
        const data = await genericFetch("/api/private/tournament/all");
        const dbPanel = document.getElementById("db-panel");
        const chainPanel = document.getElementById("chain-panel");
        if (!dbPanel || !chainPanel) return;

        const allUserIds = new Set<number>();
		data.forEach((t: any) => { 
			if (Array.isArray(t.ranking)) t.ranking.forEach((id: number) => { if (id !== -1) allUserIds.add(id); }); 
			if (Array.isArray(t.blockchainRanking)) t.blockchainRanking.forEach((id: number) => { if (id !== -1) allUserIds.add(id); }); 
		});
        const usersInfo = await genericFetch("/api/private/users/by-ids", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [...allUserIds] })
        });

        const userMap: Record<number, any> = {};
        (Array.isArray(usersInfo) ? usersInfo : []).forEach((u: any) => {
            userMap[u.user_id] = u;
        });
		// ======== Database ========
        dbPanel.innerHTML = data.map((t: any) => `
            <div class="rounded-xl border bg-white p-4 shadow-sm tournament-item" style="display:none">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-lg font-semibold">🏆 Tournament #${t.tournamentId}</h3>
                    <span class="${t.onChain ? 'text-green-600' : 'text-red-600'} text-sm font-medium ml-2">
                        ${t.onChain ? '✅ On Chain' : '❌ Not On Chain'}
                    </span>
                </div>
                <p class="text-sm font-medium text-slate-600">Database Ranking</p>
                ${Array.isArray(t.ranking) ? formatRanking(t.ranking, userMap) : `<p class="italic text-slate-500">N/A</p>`}
            </div>
        `).join("");

		if (data.length > MAX_SHOW) {
			const notice = document.createElement("p");
			notice.className = "text-sm italic text-amber-600";
			notice.textContent = `Found ${data.length} tournaments. Please use the search bar to access specific tournament.`;
			dbPanel.prepend(notice);
		}
		// ======== Blockchain ========
        const blockchainTournaments = data.filter((t: any) => Array.isArray(t.blockchainRanking) && t.blockchainRanking.length > 0);
        chainPanel.innerHTML = blockchainTournaments.map((t: any) => `
            <div class="rounded-xl border bg-white p-4 shadow-sm tournament-item" style="display:none">
                <h3 class="text-lg font-semibold">⛓ Tournament #${t.tournamentId}</h3>
                <p class="text-sm font-medium text-slate-600">Blockchain Ranking</p>
                ${formatRanking(t.blockchainRanking, userMap, true)}
            </div>
        `).join("");

		if (blockchainTournaments.length > MAX_SHOW) {
			const notice = document.createElement("p");
			notice.className = "text-sm italic text-green-600";
			notice.textContent = `Found ${blockchainTournaments.length} tournaments on blockchain. Please use the search bar to access specific tournament.`;
			chainPanel.prepend(notice);
		}
    } catch (err) {
        console.error("Error loading DB/Blockchain comparison:", err);
        showToast(err, "error", 2000, "Error loading DB/Blockchain comparison:");
    }
}

// ===================== filter/search =====================
function filterTournaments(panelId: string, query: string) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const tournaments = Array.from(panel.querySelectorAll<HTMLDivElement>(".tournament-item"));

    let showItems: HTMLDivElement[] = [];

    if (query === "last8") {
        showItems = tournaments.slice(-MAX_SHOW);
    } else if (query === "last8-onchain") {
        showItems = tournaments.filter(t => t.querySelector("span")?.textContent?.includes("✅ On Chain")).slice(-MAX_SHOW);
    } else if (query === "") {
        showItems = [];
    } else {
        const q = query.trim().toLowerCase();
		if (q.startsWith("pseudo:")) {
            const pseudoQ = q.slice(7).toLowerCase();
            showItems = tournaments.filter(t => {
                const rankingText = t.textContent?.toLowerCase() || "";
                return rankingText.includes(pseudoQ);
            });
        } else if (/^\d+$/.test(q)) {
            showItems = tournaments.filter(t => {
                const idText = t.querySelector("h3")?.textContent?.match(/\d+/)?.[0] || "";
                return idText === q;
            });
        } else {
            showItems = tournaments.filter(t => {
                const rankingText = t.textContent?.toLowerCase() || "";
                return rankingText.includes(q);
            });
        }
    }

    tournaments.forEach(t => t.style.display = "none");
    showItems.forEach(t => t.style.display = "block");
}

