import { createGameInfoTable } from "./gameinfo.model.js";
import { initDB } from "./db.js"

export const getGameInfo = async (req, res) => {
	const db = await initDB();
	await createGameInfoTable(db);
	const gameInfo = await db.all("SELECT * FROM game_info");
	res.json(gameInfo);
};