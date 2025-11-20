import { HomeView } from "./views/home";
import { LoginView, initLogin} from "./views/login";
import { DashboardView } from "./views/dashboard";
import { isLoggedIn, logout } from "./auth";
import { RegisterView, initRegister } from "./views/register";
import { HomeLoginView} from "./views/p_homelogin";
import { ProfilView} from "./views/p_profil";
import { GameView} from "./views/p_game";
import { TournamentView} from "./views/p_tournament";

const routes = [
  { path: "/", view: HomeView },
  { path: "/login", view: LoginView, init:initLogin},
  { path: "/dashboard", view: DashboardView },
  { path: "/register", view: RegisterView, init: initRegister},
  { path: "/homelogin", view: HomeLoginView},
  { path: "/profil", view: ProfilView},
  { path: "/game", view: GameView },
  { path: "/tournament", view: TournamentView}
];

export function navigateTo(url: string) {
  history.pushState(null, "", url);
  router();
}

export function router() {
  const match = routes.find((r) => r.path === location.pathname);
	console.log(match);
  if (!match) {
	document.querySelector("#app")!.innerHTML = "<h1>404 Not Found</h1>";
	return;
  }
  document.querySelector("#app")!.innerHTML = match.view();
  match.init?.();
  if (match.path == "/game")
  {
    const script = document.createElement("script");
    script.src = "/src/game/game.js";
    script.defer = true;
    document.body.appendChild(script);
  }
}

export function initRouter() {
  document.body.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest("[data-link]") as HTMLElement | null;
    if (link) {
      e.preventDefault();
      const url = (link as HTMLAnchorElement).getAttribute("href");
      if (url) {
        navigateTo(url);
      }
    }
  });
  window.addEventListener("popstate", router);
  router();
  localStorage.removeItem("token") /*a enlever quand logout ok*/
}

