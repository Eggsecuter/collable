import { alignItems, alignSelf, attribute, background, borderLeft, borderRadius, child, color, cursor, display, flexDirection, fontSize, gap, hover, margin, maxWidth, padding, px, rem, textAlign } from "@acryps/style";
import { box, boxRadius, colorBackground, colorError, colorHighlight, colorPrimary, colorTextDimmed, colorWarning, fontSizeDetail, fontSizeSubtitle } from "../index.style";

const contentWidth = px(640);

export const helpStyle = () => child('ui-help')(
	display('flex'),
	flexDirection('column'),
	gap(rem(1.5)),
	maxWidth(contentWidth),
	margin(0, 'auto'),

	child('ui-prompt')(
		display('block'),
		textAlign('center'),

		color(colorTextDimmed),
		fontSize(fontSizeSubtitle)
	),

	child('ui-section')(
		display('flex'),
		flexDirection('column'),
		gap(rem(0.75)),
		padding(rem(1.25), rem(1.5)),
		box(),

		child('ui-title')(
			display('flex'),
			gap(rem(0.5)),
			alignItems('center'),
			color(colorPrimary),
			fontSize(fontSizeSubtitle)
		),

		child('ui-text')(
			display('block'),
			color(colorTextDimmed),

			child('ui-link')(
				color(colorPrimary),
				cursor('pointer')
			)
		),

		child('ui-results')(
			display('flex'),
			flexDirection('column'),
			gap(rem(0.5)),

			child('ui-result')(
				display('flex'),
				flexDirection('column'),
				gap(rem(0.25)),
				padding(rem(0.6), rem(1)),
				box(),
				borderLeft(px(4), 'solid', colorError),

				child('ui-name')(
					display('flex'),
					gap(rem(0.4)),
					alignItems('center'),
					color(colorError)
				),

				child('ui-text')(
					display('block'),
					color(colorTextDimmed),
					fontSize(fontSizeDetail)
				),

				attribute('ui-correct')(
					borderLeft(px(4), 'solid', colorPrimary),

					child('ui-name')(
						color(colorPrimary)
					)
				),

				attribute('ui-collaborator')(
					borderLeft(px(4), 'solid', colorWarning),

					child('ui-name')(
						color(colorWarning)
					)
				)
			)
		)
	),

	child('ui-play')(
		display('block'),
		alignSelf('center'),
		padding(rem(0.75), rem(1.5)),
		borderRadius(boxRadius),

		background(colorPrimary),
		color(colorBackground),
		cursor('pointer'),

		hover()(
			background(colorHighlight)
		)
	)
);
