import { Component } from "@acryps/page";
// import { brandIcon } from "./.built/icons";

export class PageComponent extends Component {
	render(child) {
		this.router.onroutechanged = () => {
			window.scrollTo(0, 0);
		}

		return <ui-page>
			<ui-header>
				<ui-brand>
					{/*{brandIcon()}*/}
					<ui-name>Collable</ui-name>
				</ui-brand>
			</ui-header>

			<ui-main>
				{child}
			</ui-main>
		</ui-page>;
	}
}
