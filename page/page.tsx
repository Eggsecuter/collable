import { Component } from "@acryps/page";
import { brandIcon } from "./.built/icons";

export class PageComponent extends Component {
	render(child) {
		this.router.onroutechanged = () => {
			window.scrollTo(0, 0);
		}

		return <ui-page>
			<ui-header>
				<ui-brand ui-href='/'>
					{brandIcon()}
					<ui-name>Collable</ui-name>
				</ui-brand>

				<ui-navigation>
					<ui-link ui-href='' ui-href-active>Today</ui-link>
					<ui-link ui-href='/archive' ui-href-active>Archive</ui-link>
					<ui-link ui-href='/how-to-play' ui-href-active>How to play</ui-link>
				</ui-navigation>
			</ui-header>

			<ui-main>
				{child}
			</ui-main>
		</ui-page>;
	}
}
