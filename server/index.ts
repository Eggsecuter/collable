import { json } from "express";
import { join } from "path";
import { DbClient, RunContext } from "vlquery";
import { StaticFileRoute, ViewModel } from "vlserver";
import { DbContext } from "./managed/database";
import { ManagedServer } from "./managed/server";

DbClient.connectedClient = new DbClient({});

DbClient.connectedClient.connect().then(async () => {
	const database = new DbContext(new RunContext());

	const app = new ManagedServer();
	app.app.use(json());

	ViewModel.globalFetchingContext = database;

	app.use(new StaticFileRoute('/assets/icons', join(process.cwd(), '..', 'page', '.built', 'icons', 'font')));
	app.use(new StaticFileRoute('/assets/', join(process.cwd(), '..', 'page', 'assets')));
	app.use(new StaticFileRoute('/bundle/', join(process.cwd(), '..', 'page', '.built')));

	app.prepareRoutes();

	app.app.use('*', (_, response) => response.sendFile(join(process.cwd(), '..', 'page', 'assets', 'index.html')));

	app.start(+process.env.PORT! || 7060);
});
