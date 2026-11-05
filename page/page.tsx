import { Component } from "@acryps/page";
import { archiveIcon, brandIcon, closeIcon, helpIcon, menuIcon, todayIcon } from "./.built/icons";

export class PageComponent extends Component {
	header: HTMLElement;
	menuButton: HTMLElement;

	render(child) {
		this.router.onroutechanged = () => {
			this.toggleMenu(false);

			window.scrollTo(0, 0);
		}

		return <ui-page>
			{this.header = <ui-header>
				<ui-brand ui-href='/'>
					{brandIcon()}
					<ui-name>Collable</ui-name>
				</ui-brand>

				<ui-navigation>
					<ui-link ui-href='' ui-href-active>
						{todayIcon()}
						Today
					</ui-link>

					<ui-link ui-href='/archive' ui-href-active>
						{archiveIcon()}
						Archive
					</ui-link>

					<ui-link ui-href='/how-to-play' ui-href-active>
						{helpIcon()}
						How to play
					</ui-link>
				</ui-navigation>

				{this.menuButton = <ui-menu ui-click={() => this.toggleMenu(!this.header.hasAttribute('ui-open'))}>
					{menuIcon()}
				</ui-menu>}
			</ui-header>}

			<ui-main>
				{child}
			</ui-main>
		</ui-page>;
	}

	// the navigation is collapsed into a menu on mobile, toggled without re-rendering the page
	toggleMenu(open: boolean) {
		this.header.toggleAttribute('ui-open', open);
		this.menuButton.replaceChildren(open ? closeIcon() : menuIcon());
	}
}
