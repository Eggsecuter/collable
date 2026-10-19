import { background, child, color, display, height, insetInline, margin, marginTop, padding, position, rem, root, top } from "@acryps/style";
import { mediumFont } from "./assets/font/index.style";
import { colorBackground, colorBackgroundDimmed, colorText } from "./index.style";

const headerInnerHeight = rem(5);
const headerPadding = rem(0.5);

const headerTotalHeight = headerInnerHeight.add(headerPadding.multiply(2));

export const applicationStyle = () => root() (
	// icons(),
	// iconFont,
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
				padding(headerPadding),

				background(colorBackground)
			),

			child('ui-main')(
				display('block'),
				marginTop(headerTotalHeight),
				padding(rem(3))
			)
		)
	)
);
