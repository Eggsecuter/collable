import { alignItems, attribute, background, border, borderRadius, boxShadow, child, color, cursor, display, flexDirection, flexGrow, fontSize, gap, gridTemplateColumns, height, hover, insetInline, left, margin, maxWidth, minHeight, outline, overflow, padding, percentage, placeholder, position, px, rem, repeat, stroke, strokeWidth, textAlign, textOverflow, top, whiteSpace, width, zIndex, vh, bottom, fr, Keyframes, translateX, transform, opacity, hex, fontFamily, milliseconds, empty, focus, borderLeft, min, minMax, scale, flexWrap, justifyContent, textTransform, borderBottom } from "@acryps/style";
import { highlightDuration } from "../quiz/graph";
import { box, boxRadius, colorBackground, colorBackgroundDimmed, colorBorder, colorWarning, colorBoxShadow, colorError, colorHighlight, colorPrimary, colorText, colorTextDimmed, fontSizeDetail, fontSizeSubtitle, fontSizeTitle } from "../index.style";

const contentWidth = px(640);
const fieldHeight = rem(3);

const shake = new Keyframes('shake')
	.addKeyframe(percentage(25), transform(translateX(rem(-0.4))))
	.addKeyframe(percentage(75), transform(translateX(rem(0.4))));

// nodes are positioned with transform, so the flash only changes colors
const flash = new Keyframes('flash')
	.addKeyframe([percentage(0), percentage(35), percentage(70)],
		background(colorError),
		border(px(1), 'solid', colorError),
		color(colorBackground),
		boxShadow(hex('FF537066'), 0, 0, rem(1.5))
	)
	.addKeyframe([percentage(17), percentage(52)],
		background(colorBackground),
		border(px(1), 'solid', colorBorder),
		color(colorText),
		boxShadow(hex('FF537000'), 0, 0, rem(1.5))
	);

const reveal = new Keyframes('reveal')
	.addKeyframe('from', transform(scale(0.4)), opacity(0))
	.addKeyframe(percentage(60), transform(scale(1.2)), opacity(1));

const appear = new Keyframes('appear')
	.addKeyframe('from', opacity(0));

const flashLine = new Keyframes('flash-line')
	.addKeyframe([percentage(0), percentage(35), percentage(70)], stroke(colorError))
	.addKeyframe([percentage(17), percentage(52)], stroke(colorBorder));

export const homeStyle = () => child('ui-home')(
	shake,
	flash,
	flashLine,
	reveal,
	appear,

	display('flex'),
	flexDirection('column'),
	gap(rem(1.5)),
	maxWidth(contentWidth),
	margin(0, 'auto'),

	child('ui-prompt')(
		display('block'),
		textAlign('center'),

		color(colorTextDimmed),
		fontSize(fontSizeSubtitle),

		child('ui-date')(
			display('block'),
			color(colorText)
		)
	),

	child('ui-graph')(
		position('relative'),
		display('block'),
		width(percentage(100)),
		// fixed height instead of an aspect ratio, so narrow screens get more vertical room for the wide labels
		height(min(vh(55), rem(32))),
		minHeight(rem(20)),

		child('svg')(
			position('absolute'),
			top(0),
			left(0),
			width(percentage(100)),
			height(percentage(100)),

			child('line')(
				stroke(colorBorder),
				strokeWidth(px(2)),

				attribute('ui-guessed')(
					stroke(colorWarning)
				),

				attribute('ui-highlighted')(
					flashLine.animate(milliseconds(highlightDuration), 'ease-out')
				)
			)
		),

		child('ui-node')(
			position('absolute'),
			top(0),
			left(0),

			display('block'),
			maxWidth(rem(9)),
			padding(rem(0.4), rem(0.8)),
			box(),
			borderRadius(rem(2)),

			whiteSpace('nowrap'),
			overflow('hidden'),
			textOverflow('ellipsis'),
			fontSize(fontSizeDetail),

			attribute('ui-center')(
				zIndex(1),
				padding(rem(0.8), rem(1.2)),

				background(colorPrimary),
				border(px(1), 'solid', colorPrimary),
				color(colorBackground),
				fontSize(fontSizeTitle),

				boxShadow(hex('1ED76059'), 0, 0, rem(2))
			),

			attribute('ui-revealed')(
				maxWidth(rem(16)),
				fontSize(fontSizeSubtitle)
			),

			attribute('ui-guessed')(
				border(px(1), 'solid', colorWarning),
				color(colorWarning),
				boxShadow(hex('FFC85740'), 0, 0, rem(1))
			),

			attribute('ui-appearing')(
				appear.animate(milliseconds(highlightDuration), 'ease-out')
			),

			attribute('ui-highlighted')(
				zIndex(2),
				flash.animate(milliseconds(highlightDuration), 'ease-out')
			)
		)
	),

	child('ui-name-hint')(
		display('flex'),
		flexWrap('wrap'),
		justifyContent('center'),
		gap(rem(0.5), rem(1)),

		child('ui-word')(
			display('flex'),
			gap(rem(0.25)),

			child('ui-letter')(
				display('flex'),
				alignItems('center'),
				justifyContent('center'),
				width(rem(1.75)),
				height(rem(2.25)),
				box(),
				borderRadius(rem(0.4)),

				fontSize(fontSizeSubtitle),
				textTransform('uppercase'),

				attribute('ui-hidden')(
					background(colorBackgroundDimmed),
					borderBottom(px(2), 'solid', colorTextDimmed)
				),

				attribute('ui-revealed')(
					border(px(1), 'solid', colorHighlight),
					color(colorHighlight),
					reveal.animate(milliseconds(400), 'ease-out')
				)
			)
		),

		attribute('ui-solved')(
			child('ui-word')(
				child('ui-letter')(
					border(px(1), 'solid', colorPrimary),
					color(colorPrimary)
				)
			)
		),

		attribute('ui-failed')(
			child('ui-word')(
				child('ui-letter')(
					border(px(1), 'solid', colorError),
					color(colorError)
				)
			)
		)
	),

	child('ui-guess-field')(
		position('relative'),
		display('block'),

		child('ui-field')(
			display('flex'),
			gap(rem(0.5)),

			child('input')(
				flexGrow(1),
				height(fieldHeight),
				padding(0, rem(1)),
				box(),

				color(colorText),
				fontSize(rem(1)),
				fontFamily('inherit'),
				outline('none'),

				focus()(
					border(px(1), 'solid', colorPrimary)
				),

				placeholder()(
					color(colorTextDimmed)
				),

				attribute('ui-invalid')(
					border(px(1), 'solid', colorError),
					shake.animate(milliseconds(300), 'ease-in-out')
				)
			),

			child('ui-submit')(
				display('flex'),
				alignItems('center'),
				padding(0, rem(1.5)),
				borderRadius(boxRadius),

				background(colorPrimary),
				color(colorBackground),
				cursor('pointer'),

				hover()(
					background(colorHighlight)
				)
			)
		),

		child('ui-suggestions')(
			position('absolute'),
			insetInline(0),
			bottom(percentage(100).add(rem(0.5))),
			zIndex(2),

			display('flex'),
			flexDirection('column'),
			overflow('hidden'),
			box(),
			boxShadow(colorBoxShadow, 0, rem(0.5), rem(2)),

			empty()(
				display('none')
			),

			child('ui-suggestion')(
				display('block'),
				padding(rem(0.75), rem(1)),
				cursor('pointer'),

				hover()(
					color(colorPrimary)
				),

				attribute('ui-selected')(
					background(colorBorder)
				)
			)
		)
	),

	child('ui-result')(
		display('flex'),
		flexDirection('column'),
		alignItems('center'),
		gap(rem(0.75)),
		padding(rem(1.5)),
		box(),

		child('ui-title')(
			display('block'),
			color(colorError),
			fontSize(fontSizeTitle)
		),

		attribute('ui-solved')(
			child('ui-title')(
				color(colorPrimary)
			)
		),

		child('ui-share')(
			display('block'),
			padding(rem(0.75), rem(1.5)),
			borderRadius(boxRadius),

			background(colorPrimary),
			color(colorBackground),
			cursor('pointer'),

			hover()(
				background(colorHighlight)
			)
		),

		child('ui-hint')(
			display('block'),
			textAlign('center'),
			color(colorTextDimmed),
			fontSize(fontSizeDetail),

			child('ui-link')(
				color(colorPrimary),
				cursor('pointer')
			)
		)
	),

	child('ui-guesses')(
		display('grid'),
		gridTemplateColumns(repeat('auto-fill', minMax(rem(14), fr(1)))),
		gap(rem(0.5)),

		child('ui-guess')(
			display('block'),
			minHeight(rem(1.25)),
			padding(rem(0.6), rem(1)),
			box(),
			borderLeft(px(4), 'solid', colorError),

			whiteSpace('nowrap'),
			overflow('hidden'),
			textOverflow('ellipsis'),

			attribute('ui-correct')(
				borderLeft(px(4), 'solid', colorPrimary),
				color(colorPrimary)
			),

			attribute('ui-collaborator')(
				borderLeft(px(4), 'solid', colorWarning),
				color(colorWarning)
			),

			attribute('ui-empty')(
				borderLeft(px(1), 'solid', colorBorder),
				opacity(0.4)
			)
		)
	)
);
