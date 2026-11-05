import { alignItems, attribute, background, bottom, child, color, cursor, display, flexDirection, fontSize, gap, height, hover, insetInline, margin, marginLeft, marginTop, maxWidth, media, padding, percentage, position, rem, root, seconds, top, transform, translate, zIndex } from "@acryps/style";
import { iconFont, icons } from "./.built/icons";
import { mediumFont } from "./assets/font/index.style";
import { archiveStyle } from "./archive/index.style";
import { helpStyle } from "./help/index.style";
import { homeStyle } from "./home/index.style";
import { colorBackground, colorBackgroundDimmed, colorPrimary, colorText, colorTextDimmed, fontSizeNavigation, widthMobile } from "./index.style";

const headerInnerHeight = rem(3);
const headerBlockPadding = rem(1);
const headerInlinePadding = rem(2);
const mobileInlinePadding = rem(1);

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
				// the graph nodes are layered, they must stay below the header
				zIndex(3),

				display('flex'),
				height(headerInnerHeight),
				padding(headerBlockPadding, headerInlinePadding),

				gap(rem(1)),
				alignItems('center'),

				background(colorBackground),

				media(maxWidth(widthMobile))(
					padding(headerBlockPadding, mobileInlinePadding).important()
				),

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
						display('flex'),
						gap(rem(0.4)),
						alignItems('center'),

						color(colorTextDimmed),
						cursor('pointer'),

						hover()(
							color(colorText)
						),

						attribute('ui-active')(
							color(colorPrimary)
						)
					),

					// slides in below the header
					media(maxWidth(widthMobile))(
						position('fixed'),
						top(headerTotalHeight),
						bottom(0),
						insetInline(0),

						flexDirection('column'),
						gap(rem(1.5)).important(),
						padding(rem(2), mobileInlinePadding),

						background(colorBackground),
						fontSize(fontSizeNavigation),

						transform(translate(percentage(100), 0)).transition(seconds(0.3))
					)
				),

				child('ui-menu')(
					display('none'),
					marginLeft('auto'),

					fontSize(fontSizeNavigation),
					cursor('pointer'),

					media(maxWidth(widthMobile))(
						display('flex').important()
					)
				),

				attribute('ui-open')(
					child('ui-navigation')(
						transform(translate(0, 0))
					)
				)
			),

			child('ui-main')(
				display('block'),
				marginTop(headerTotalHeight),
				padding(headerInlinePadding),

				media(maxWidth(widthMobile))(
					padding(rem(1.5), mobileInlinePadding).important()
				),

				homeStyle(),
				archiveStyle(),
				helpStyle()
			)
		)
	)
);
