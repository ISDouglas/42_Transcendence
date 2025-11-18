import { ManageDB } from "./manageDB";

export class GameInfo
{
	private _db: ManageDB;

	constructor(db: ManageDB)
	{
		this._db = db;
	}

	static async createGameInfoTable(db: ManageDB) {
		await db.execute(`
			CREATE TABLE IF NOT EXISTS game_info (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				status INTEGER NOT NULL,
				winner_id INTEGER NOT NULL,
				loser_id INTEGER NOT NULL,
				date_game TEXT NOT NULL,
				duration_game INTEGER DEFAULT 0,
				adversary_name TEXT NOT NULL,
				winner_score INTEGER,
				loser_score INTEGER
			)
		`);
	};

	async addGameInfo(winner_id: number, loser_id: number, winner_score: number, loser_score: number, duration_game: number, adversary_name: string): Promise<void>
	{
		const query = `
			INSERT INTO game_info (status, winner_id, loser_id,
			 date_game, duration_game, adversary_name, winner_score, loser_score)
			VALUES (?,?,?,?,?,?,?,?)
			`;
		const parameters = [
			GameInfoStatus.finished,
			winner_id,
			loser_id,
			new Date(),
			duration_game,
			adversary_name,
			winner_score,
			loser_score
		];

		await this._db.execute(query, parameters);
	}

	async deleteGameInfoTable()
	{
		const query = `DROP TABLE IF EXISTS game_info`
		await this._db.execute(query, []);
	}
}

enum GameInfoStatus
{
	playing,
	finished,
	error
}
