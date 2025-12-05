import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "~/lib/prisma/client";

const CONNECTION_STRING = process.env.DATABASE_URL;
if (!CONNECTION_STRING) {
	throw new Error("DATABASE_URL is not set");
}

let prisma: PrismaClient;

declare global {
	var __db__: PrismaClient;
}

// This is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// In production, we'll have a single connection to the DB.
if (process.env.NODE_ENV === "production") {
	prisma = getClient();
} else {
	if (!global.__db__) {
		global.__db__ = getClient();
	}
	prisma = global.__db__;
}

function getClient() {
	const adapter = new PrismaBetterSqlite3({ url: CONNECTION_STRING ?? "" });
	return new PrismaClient({ adapter });
}

export { prisma };
