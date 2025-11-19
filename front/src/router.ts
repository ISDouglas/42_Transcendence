import { HomeView } from "./views/home";
import { LoginView, initLogin, isLoggedIn} from "./views/login";
import { DashboardView } from "./views/dashboard";
import { RegisterView, initRegister } from "./views/register";
import { HomeLoginView, initHomePage} from "./views/p_homelogin";
import { ProfilView} from "./views/p_profil";
import { GameView, initGame} from "./views/p_game";
import { TournamentView} from "./views/p_tournament";

const routes = [
  { path: "/", view: HomeView },
  { path: "/login", view: LoginView, init:initLogin},
  { path: "/dashboard", view: DashboardView },
  { path: "/register", view: RegisterView, init: initRegister},
  { path: "/homelogin", view: HomeLoginView, init: initHomePage},
  { path: "/profil", view: ProfilView},
  { path: "/game", view: GameView, init: initGame},
  { path: "/tournament", view: TournamentView}
];

export function navigateTo(url: string) {
  history.pushState(null, "", url);
  router();
}

export async function genericFetch(url: string, options: RequestInit = {}) {
	const res = await fetch(url, {
		...options,
		credentials: "include"
	});
	if (res.status === 401) {
		navigateTo("/login");
		updateNav();
		throw new Error("Unauthorized");
	}
	if (!res.ok){
		throw new Error(`Error: ${res.status}`);
	}
	return res;
}


export function updateNav() {
	const publicNav = document.getElementById("public-nav")!;
	const privateNav = document.getElementById("private-nav")!;
	isLoggedIn().then(logged => {
		if (logged) {
			publicNav.style.display = "none";
			privateNav.style.display = "block";
		}	else {
  			publicNav.style.display = "block";
			privateNav.style.display = "none";
		}
	});
}

export function router() {
  const match = routes.find((r) => r.path === location.pathname);

  if (!match) {
	document.querySelector("#app")!.innerHTML = "<h1>404 Not Found</h1>";
	return;
  }
  document.querySelector("#app")!.innerHTML = match.view();
  match.init?.();
  updateNav();
}

export function initRouter() {
  document.body.addEventListener("click", (e) => {
	const target = e.target as HTMLElement;
	if (target.matches("[data-link]")) {
	  e.preventDefault();
	  navigateTo(target.getAttribute("href")!);
	}
  });
  window.addEventListener("popstate", router);
  router();
}

export const logout = async() => {
	await fetch("/api/logout", {
		method: "GET",
		credentials: "include"
		});
	navigateTo("/login");
	updateNav();
}
