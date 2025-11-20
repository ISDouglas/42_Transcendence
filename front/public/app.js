// front/src/views/home.ts
function HomeView() {
  return document.getElementById("homehtml").innerHTML;
}

// front/src/auth.ts
async function login(username, password) {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const result = await res.json();
    if (res.ok) {
      localStorage.setItem("token", "OK");
      return true;
    } else
      return false;
  } catch (err) {
    console.error("Erreur serveur:", err);
    return false;
  }
}

// front/src/views/login.ts
function LoginView() {
  return document.getElementById("loginhtml").innerHTML;
}
function initLogin() {
  const form = document.getElementById("login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const success = await login(username, password);
    if (success)
      navigateTo("/homelogin");
    else
      alert("Identifiants incorrects");
  });
}

// front/src/views/dashboard.ts
function DashboardView() {
  return document.getElementById("dashboardhtml").innerHTML;
}

// front/src/views/register.ts
function RegisterView() {
  return document.getElementById("registerhtml").innerHTML;
}
function initRegister() {
  const form = document.getElementById("register-form");
  const message = document.getElementById("register-message");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password")
    };
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      message.textContent = result.message;
    } catch (err) {
      message.textContent = "Erreur serveur...";
      console.error(err);
    }
  });
}

// front/src/views/p_homelogin.ts
function HomeLoginView() {
  return document.getElementById("homeloginhtml").innerHTML;
}

// front/src/views/p_profil.ts
function ProfilView() {
  return document.getElementById("profilhtml").innerHTML;
}

// front/src/views/p_game.ts
function GameView() {
  return document.getElementById("gamehtml").innerHTML;
}

// front/src/views/p_tournament.ts
function TournamentView() {
  return document.getElementById("tournamenthtml").innerHTML;
}

// front/src/router.ts
var routes = [
  { path: "/", view: HomeView },
  { path: "/login", view: LoginView, init: initLogin },
  { path: "/dashboard", view: DashboardView },
  { path: "/register", view: RegisterView, init: initRegister },
  { path: "/homelogin", view: HomeLoginView },
  { path: "/profil", view: ProfilView },
  { path: "/game", view: GameView },
  { path: "/tournament", view: TournamentView }
];
function navigateTo(url) {
  history.pushState(null, "", url);
  router();
}
function router() {
  const match = routes.find((r) => r.path === location.pathname);
  console.log(match);
  if (!match) {
    document.querySelector("#app").innerHTML = "<h1>404 Not Found</h1>";
    return;
  }
  document.querySelector("#app").innerHTML = match.view();
  match.init?.();
  if (match.path == "/game") {
    const script = document.createElement("script");
    script.src = "/src/game/game.js";
    script.defer = true;
    document.body.appendChild(script);
  }
}
function initRouter() {
  document.body.addEventListener("click", (e) => {
    const target = e.target;
    const link = target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      const url = link.getAttribute("href");
      if (url) {
        navigateTo(url);
      }
    }
  });
  window.addEventListener("popstate", router);
  router();
  localStorage.removeItem("token");
}

// front/src/main.ts
document.addEventListener("DOMContentLoaded", () => {
  initRouter();
});
