import { initRouter, logout} from "./router";

document.addEventListener("DOMContentLoaded", () => {
	initRouter();
	const button = document.getElementById("butlogout")!;
	button.addEventListener("click", async () => {
		await logout();
	});
});

