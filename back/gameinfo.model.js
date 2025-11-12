export const createGameInfoTable = async(db) => {
	await db.exec(`
		CREATE TABLE IF NOT EXISTS game_info (
			winner_id INTEGER,
			looser_id INTEGER,
			date_game DATE,
			duration_game REAL,
			adversary_name TEXT,
			score TEXT
		)
	`);
};