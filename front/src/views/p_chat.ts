import { chatNetwork, dataChat } from "../chat/chatNetwork";

export const chatnet: chatNetwork = new chatNetwork();

export async function displayChat() {	
	const template = document.getElementById("chat-template") as HTMLTemplateElement;
	const clone = template.content.cloneNode(true);
	document.getElementById("chat-container")!.appendChild(clone);

	const chatBar = document.getElementById("chat-bar");
	const chatWindow = document.getElementById("chat-window");

	chatBar!.addEventListener("click", () => {
		chatWindow!.classList.toggle("hidden");
		chatWindow!.classList.toggle("flex");
	});

	const form = document.getElementById("chat-form");
	const input = document.getElementById("chat-input") as HTMLInputElement;
	
	chatnet.receiveHistory((messages) => {
		messages.forEach(msg => addMessageGeneral(msg));
	});

	chatnet.receiveMessage((data) => {
			addMessageGeneral(data);
		})
	
		chatnet.receiveError((error) => {
			displayError(error.error);
		})

	chatnet.requestHistory();
	
	form!.addEventListener("submit", (e) => {
		e.preventDefault();

		chatnet.sendMessage(input.value);
		input.value = "";
	});
}

function addMessageGeneral(data: dataChat) {
	const box = document.getElementById("chat-box");

	const div = document.createElement("div");
	div.className = "bg-gray-800 p-2 rounded-lg";

	div.innerHTML = `
		<div class="flex items-center justify-between">
			<span class="font-semibold text-green-400">${data.pseudo}</span>
			<span class="text-xs text-gray-400">${new Date(data.date).toLocaleTimeString()}</span>
		</div>
		<div class="text-gray-200">${data.message}</div>
	`;

	box!.appendChild(div);
	box!.scrollTop = box!.scrollHeight;
}

function displayError(message: string) {
	const input = document.getElementById("chat-input") as HTMLInputElement;
	const oldPlaceholder = input.placeholder;
	input.style.border = "2px solid red";
	// input.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
	input.placeholder = message;

	setTimeout(() => {
		input.classList.remove("input-error");
		input.placeholder = oldPlaceholder;
		input.style.border = "";
	}, 1500);
}