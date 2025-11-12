import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const initDB = async () => {
  return open({
    filename: "./src/database.sqlite", // <-- ce fichier sera créé
    driver: sqlite3.Database
  });
};
