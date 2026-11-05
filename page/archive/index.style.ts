import { alignItems, borderRadius, justifyContent, attribute, background, border, borderLeft, child, color, cursor, display, flexBasis, flexDirection, flexGrow, flexWrap, fontSize, gap, height, hover, margin, maxWidth, media, padding, percentage, px, rem, rowGap, textAlign, width } from "@acryps/style";
import { box, colorBackground, colorBorder, colorError, colorPrimary, colorTextDimmed, colorWarning, fontSizeDetail, fontSizeSubtitle } from "../index.style";

const contentWidth = px(640);

// below this width the date gets its own row, so the results are not squeezed
const stackedWidth = px(480);

export const archiveStyle = () => child('ui-archive')(
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

	child('ui-days')(
		display('flex'),
		flexDirection('column'),
		gap(rem(0.5)),

		child('ui-day')(
			display('flex'),
			flexWrap('wrap'),
			alignItems('center'),
			gap(rem(1)),
			padding(rem(0.75), rem(1)),
			box(),
			borderLeft(px(4), 'solid', colorBorder),
			cursor('pointer'),

			media(maxWidth(stackedWidth))(
				rowGap(rem(0.5)).important()
			),

			hover()(
				border(px(1), 'solid', colorPrimary),
				borderLeft(px(4), 'solid', colorPrimary)
			),

			child('ui-date')(
				display('block'),
				flexGrow(1),

				media(maxWidth(stackedWidth))(
					flexBasis(percentage(100))
				)
			),

			child('ui-results')(
				display('flex'),
				gap(rem(0.25)),

				media(maxWidth(stackedWidth))(
					flexGrow(1)
				),

				child('ui-result')(
					display('flex'),
					alignItems('center'),
					justifyContent('center'),
					width(rem(1)),
					height(rem(1)),
					borderRadius(rem(0.2)),
					background(colorError),

					color(colorBackground),
					fontSize(rem(0.65)),

					attribute('ui-collaborator')(
						background(colorWarning)
					),

					attribute('ui-correct')(
						background(colorPrimary)
					)
				)
			),

			child('ui-status')(
				display('block'),
				width(rem(8)),
				textAlign('right'),

				color(colorTextDimmed),
				fontSize(fontSizeDetail)
			),

			attribute('ui-solved')(
				borderLeft(px(4), 'solid', colorPrimary),

				child('ui-status')(
					color(colorPrimary)
				)
			),

			attribute('ui-failed')(
				borderLeft(px(4), 'solid', colorError),

				child('ui-status')(
					color(colorError)
				)
			)
		)
	)
);
