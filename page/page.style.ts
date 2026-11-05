import { alignItems, attribute, background, child, color, cursor, display, fontSize, gap, height, hover, insetInline, margin, marginLeft, marginTop, padding, position, rem, root, top } from "@acryps/style";
import { iconFont, icons } from "./.built/icons";
import { mediumFont } from "./assets/font/index.style";
import { archiveStyle } from "./archive/index.style";
import { helpStyle } from "./help/index.style";
import { homeStyle } from "./home/index.style";
import { colorBackground, colorBackgroundDimmed, colorPrimary, colorText, colorTextDimmed, fontSizeNavigation } from "./index.style";

const headerInnerHeight = rem(3);
const headerBlockPadding = rem(1);
const headerInlinePadding = rem(2);

const headerTotalHeight = headerInnerHeight.add(headerBlockPadding.multiply(2));

export const applicationStyle = () => root() (
	icons(),
	iconFont,
	mediumFont,

	color(colorText),
	background(colorBackgroundDimmed),

	child('body') (
		display('block'),
		margin(0),
		padding(0),

		child('ui-page') (
			display('block'),

			child('ui-header')(
				position('fixed'),
				top(0),
				insetInline(0),

				display('flex'),
				height(headerInnerHeight),
				padding(headerBlockPadding, headerInlinePadding),

				gap(rem(1)),
				alignItems('center'),

				background(colorBackground),

				child('ui-brand')(
					display('flex'),
					gap(rem(0.5)),
					alignItems('center'),

					color(colorPrimary),
					fontSize(fontSizeNavigation),
					cursor('pointer')
				),

				child('ui-navigation')(
					display('flex'),
					gap(rem(2)),
					marginLeft('auto'),

					child('ui-link')(
						color(colorTextDimmed),
						cursor('pointer'),

						hover()(
							color(colorText)
						),

						attribute('ui-active')(
							color(colorPrimary)
						)
					)
				)
			),

			child('ui-main')(
				display('block'),
				marginTop(headerTotalHeight),
				padding(headerInlinePadding),

				homeStyle(),
				archiveStyle(),
				helpStyle()
			)
		)
	)
);
