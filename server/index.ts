import cookieParser from "cookie-parser";
import { json } from "express";
import { join } from "path";
import { DbClient, RunContext } from "vlquery";
import { Inject, StaticFileRoute, ViewModel } from "vlserver";
import { DbContext } from "./managed/database";
import { ManagedServer } from "./managed/server";
import { assignPlayer, PlayerContext } from "./player/context";

DbClient.connectedClient = new DbClient({});

DbClient.connectedClient.connect().then(async () => {
	const database = new DbContext(new RunContext());

	const app = new ManagedServer();
	app.app.use(json());
	app.app.use(cookieParser());
	app.app.use(assignPlayer);

	app.createInjector = (_, request, response) => new Inject({
		DbContext: database,
		PlayerContext: new PlayerContext(response.locals.playerId)
	});

	ViewModel.globalFetchingContext = database;

	app.use(new StaticFileRoute('/assets/icons', join(process.cwd(), '..', 'page', '.built', 'icons', 'font')));
	app.use(new StaticFileRoute('/assets/', join(process.cwd(), '..', 'page', 'assets')));
	app.use(new StaticFileRoute('/bundle/', join(process.cwd(), '..', 'page', '.built')));

	app.prepareRoutes();

	app.app.use('*', (_, response) => response.sendFile(join(process.cwd(), '..', 'page', 'assets', 'index.html')));

	app.start(+process.env.PORT! || 7060);
});
