import { Component, PathRouter, Router } from "@acryps/page";
import { Service } from "./managed/services";
import { PageComponent } from "./page";
import { registerDirectives } from "@acryps/page-default-directives";
import { applicationStyle } from "./page.style";
import { HomePage } from "./home";

// injected by esbuild
declare const buildDate: string;
declare const buildCommit: string;

export class Application {
	static router: Router;

	static async main() {
		Service.baseUrl = '/';

		this.router = new PathRouter(PageComponent
			.default(HomePage)
		);

		registerDirectives(Component, this.router);

		applicationStyle().apply();

		// render application
		this.router.host(document.body);

		// output build information
		console.group(`build ${buildCommit}`);
		console.log(`built ${buildDate}`);
		console.groupEnd();
	}
}

Application.main();
