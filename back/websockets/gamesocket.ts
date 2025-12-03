import { Server } from "socket.io";
import { Game } from "../routes/game/game";

export function setupSocket(io: Server, games_map: Map<number, Game>) {
	io.on("connection", (socket) => {
	console.log("Client connecté", socket.id);

	socket.on("joinGame", (gameId: string) => {

		const game = games_map.get(Number(gameId));
		if (!game) return;


		socket.join(`game-${gameId}`);

		// --- INITIALISATION POUR SOCKET.IO ---
		if (!game.sockets) {
			game.sockets = {
				player1: null,
				player2: null
			};
		}

		// Assignation automatique
		let role: "player1" | "player2";

		if (game.sockets.player1 === null) {
			game.sockets.player1 = socket.id;
			role = "player1";
			console.log("Player1 connected !");
		} 
		else if (game.sockets.player2 === null && game.sockets.player1 !== socket.id) {
			game.sockets.player2 = socket.id;
			role = "player2";
			console.log("Player2 connected !");
		}
		else if (game.sockets.player1 === socket.id || game.sockets.player2 === socket.id) {
			// Le joueur est déjà assigné, rien à faire
			role = game.sockets.player1 === socket.id ? "player1" : "player2";
			console.log("Player reconnected as", role);
		}
		else {
			// La game est déjà pleine
			socket.emit("gameFull");
			return;
		}
		
		if(game.sockets.player1 !== null && game.sockets.player2 !== null)
		{
			console.log("2 players");
			io.to(`game-${gameId}`).emit("startGame");
		}

		socket.on("disconnect", () => {
			if (game.sockets.player1 === socket.id) game.sockets.player1 = null;
			if (game.sockets.player2 === socket.id) game.sockets.player2 = null;
		});

		socket.emit("assignRole", role);

		// Envoi de l’état actuel
		socket.emit("gameState", {
			player1: { y: game.paddlePos.player1 },
			player2: { y: game.paddlePos.player2 },
			ball: game.ballPos
		});
		});

		socket.on("paddleMove", ({ gameId, player, y }: { 
			gameId: string, 
			player: "player1" | "player2", 
			y: number 
		}) => {
			const game = games_map.get(Number(gameId));
			if (!game) return;

			if (player !== "player1" && player !== "player2") return;

			game.paddlePos[player] = y;

			socket.to(`game-${gameId}`).emit("paddleMove", { player, y });
		});

		socket.on("ballMove", ({ gameId, y, x, speedX, speedY }: { 
			gameId: string, 
			y: number,
			x: number,
			speedX: number,
			speedY: number
		}) => {
			const game = games_map.get(Number(gameId));
			if (!game) return;

			game.ballPos.x = x;
			game.ballPos.y = y;
			game.ballSpeed.x = speedX;
			game.ballSpeed.y = speedY;

			socket.to(`game-${gameId}`).emit("ballMove", { x, y, speedX, speedY });
		});

		socket.on("scoreUpdate", ({ gameId, scoreP1, scoreP2}: { 
			gameId: string, 
			scoreP1: number,
			scoreP2: number
		}) => {
			const game = games_map.get(Number(gameId));
			if (!game) return;

			game.score.player1 = scoreP1;
			game.score.player2 = scoreP2;

			socket.to(`game-${gameId}`).emit("ballMove", { scoreP1, scoreP2 });
		});
	});

	const interval = setInterval(() => {
		for (const [gameId, game] of games_map.entries()) {
			game.ballPos.x += 1.2;
			game.ballPos.y += 1.2;

			// Envoie état de la balle à tous les joueurs
			io.to(`game-${gameId}`).emit("ballUpdate", game.ballPos);
		}
	}, 16);

	
	// Détecte Ctrl+C
	// process.on("SIGINT", async () => {
	// 	console.log("Fermeture du serveur…");
	
	// 	try {
	// 	// 1) Fermer Socket.io
	// 	await new Promise<void>((resolve) => {
	// 		io.close(() => {
	// 			console.log("✔️ Socket.io fermé");
	// 			resolve();
	// 		});
	// 	});

	// 	// 2) Fermer Fastify
	// 	await fastify.close();
	// 	console.log("✔️ Fastify fermé");

	// 	// 3) Fermer le serveur HTTP brut
	// 	// (très important sinon Node peut rester bloqué)
	// 	const server = fastify.server;
	// 	await new Promise<void>((resolve) => {
	// 		server.close(() => {
	// 			console.log("✔️ Serveur fermé");
	// 			resolve();
	// 		});
	// 	});

	// 	// 4) Nettoyer tout interval encore actif
	// 	clearInterval(interval);
	// 	console.log("✔️ Intervalles nettoyés");

	// } catch (err) {
	// 	console.error("Erreur pendant la fermeture:", err);
	// }
	// });
}