import Database from 'better-sqlite3';
import path from 'path';

const dbDir = process.cwd();
const resolvedDbPath = path.resolve(dbDir, 'sqlite.db');
if (!resolvedDbPath.startsWith(path.resolve(dbDir))) {
    throw new Error('Invalid database path: path traversal detected');
}
const dbPath = resolvedDbPath;
export const db = new Database(dbPath);