import { Component } from "@acryps/page";
import { playAnimation } from "./animation";

const svgNamespace = 'http://www.w3.org/2000/svg';

// matches the flash animation in the home style
export const highlightDuration = 1200;

// distance of the collaborators from the center, relative to the half of the graphs size
// neighbours alternate between an inner and outer ring, so their labels do not overlap
const outerOrbitRadius = 0.8;
const innerOrbitRadius = 0.55;

// how far nodes drift from their resting position, in pixels
const driftAmplitude = 10;

// how fast nodes move to their new place when the layout changes, per second
const layoutSpeed = 3;

// minimal space between labels, large enough that two neighbours drifting towards each other do not touch
const separationGap = driftAmplitude * 2;

// overlaps are pushed apart in a few passes, as pushing one apart can create a new overlap
const separationIterations = 8;

// the loop keeps running while the graph is moved between renders, only stop once it is gone for good
const detachedFramesLimit = 60;

type GraphNode = {
	name: string;

	element: HTMLElement;
	line?: SVGLineElement;

	// current layout, eased towards the target layout of the nodes index
	angle: number;
	radius: number;

	// pushes the node away from overlapping labels, eased so the nodes do not jump
	offsetX: number;
	offsetY: number;

	phase: number;
	speed: number;
};

type Box = {
	x: number;
	y: number;
	width: number;
	height: number;
};

// rendered once and kept across page updates, so layout changes can be animated
export class CollaborationGraph extends Component {
	element: HTMLElement;
	lines: SVGSVGElement;

	center: GraphNode;
	collaborators: GraphNode[] = [];

	// every node gets its own drift, independent of its position in the graph
	nodeCount = 0;

	constructor(
		collaboratorNames: string[]
	) {
		super();

		this.lines = document.createElementNS(svgNamespace, 'svg');
		this.center = this.createNode('?', <ui-node ui-center>?</ui-node>);

		for (let name of collaboratorNames) {
			this.addCollaborator(name, this.collaborators.length);
		}
	}

	render() {
		if (!this.element) {
			// the initial and restored nodes appear in place, only later additions are animated
			this.collaborators.forEach((node, index) => {
				node.angle = this.targetAngle(index);
				node.radius = this.targetRadius(index);
			});

			this.element = <ui-graph>
				{this.lines}

				{this.collaborators.map(node => node.element)}
				{this.center.element}
			</ui-graph>;

			this.animate();
		}

		return this.element;
	}

	// adds a collaborator at the index, the following nodes move away to make room when animated
	addCollaborator(name: string, index: number, guessed = false, animated = false) {
		const node = this.createNode(name, <ui-node ui-guessed={guessed}>{name}</ui-node>);
		node.line = document.createElementNS(svgNamespace, 'line');

		if (guessed) {
			node.line.setAttribute('ui-guessed', '');
		}

		const previous = this.collaborators[index - 1];
		const next = this.collaborators[index];

		this.collaborators.splice(index, 0, node);

		if (animated && previous) {
			// start in the gap between the neighbours, the last gap wraps around to the first node
			const nextAngle = next ? next.angle : this.collaborators[0].angle + Math.PI * 2;

			node.angle = (previous.angle + nextAngle) / 2;
			node.radius = (previous.radius + (next ?? this.collaborators[0]).radius) / 2;

			playAnimation(node.element, 'ui-appearing', highlightDuration);
		} else {
			node.angle = this.targetAngle(index);
			node.radius = this.targetRadius(index);
		}

		// nodes are drawn above the lines
		this.lines.appendChild(node.line);
		this.element?.insertBefore(node.element, this.center.element);
	}

	reveal(artistName: string) {
		this.center.element.textContent = artistName;
		this.center.element.setAttribute('ui-revealed', '');
	}

	// flashes the collaborator, used when they are guessed
	highlight(name: string) {
		const node = this.collaborators.find(collaborator => collaborator.name == name);

		if (node) {
			playAnimation(node.element, 'ui-highlighted', highlightDuration);
			playAnimation(node.line, 'ui-highlighted', highlightDuration);
		}
	}

	// start at the top and go around clockwise
	private targetAngle(index: number) {
		return Math.PI * 2 * index / this.collaborators.length - Math.PI / 2;
	}

	private targetRadius(index: number) {
		return index % 2 ? innerOrbitRadius : outerOrbitRadius;
	}

	// phase and speed are derived from a counter instead of being random, so that every graph floats the same way
	private createNode(name: string, element: HTMLElement): GraphNode {
		const index = this.nodeCount++;

		return {
			name,
			element,
			angle: 0,
			radius: 0,
			offsetX: 0,
			offsetY: 0,
			phase: index * 2.4,
			speed: 0.4 + (index * 0.37 % 1) * 0.4
		};
	}

	private animate() {
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

		let detachedFrames = 0;
		let previousTime: number;

		const frame = (time: number) => {
			// stop when the page was left
			if (this.element.isConnected) {
				detachedFrames = 0;
			} else if (++detachedFrames > detachedFramesLimit) {
				return;
			}

			// ease towards the target layout, independent of the frame rate
			const elapsed = previousTime ? (time - previousTime) / 1000 : 0;
			const easing = reducedMotion ? 1 : 1 - Math.exp(-elapsed * layoutSpeed);

			// the first frame is placed without overlaps right away
			const offsetEasing = previousTime ? easing : 1;

			previousTime = time;

			const width = this.element.clientWidth;
			const height = this.element.clientHeight;

			const center = this.measure(this.center, width / 2, height / 2);

			// resting positions on the orbits, the drift is added after the overlaps are resolved
			const resting = this.collaborators.map((node, index) => {
				node.angle += (this.targetAngle(index) - node.angle) * easing;
				node.radius += (this.targetRadius(index) - node.radius) * easing;

				return this.measure(
					node,
					width / 2 + Math.cos(node.angle) * width / 2 * node.radius,
					height / 2 + Math.sin(node.angle) * height / 2 * node.radius
				);
			});

			const separated = this.separate(resting, center, width, height);

			const centerPosition = this.place(this.center, center.x, center.y, time, reducedMotion ? 0 : driftAmplitude / 2);

			this.collaborators.forEach((node, index) => {
				node.offsetX += (separated[index].x - resting[index].x - node.offsetX) * offsetEasing;
				node.offsetY += (separated[index].y - resting[index].y - node.offsetY) * offsetEasing;

				const position = this.place(
					node,
					resting[index].x + node.offsetX,
					resting[index].y + node.offsetY,
					time,
					reducedMotion ? 0 : driftAmplitude
				);

				node.line.setAttribute('x1', `${centerPosition.x}`);
				node.line.setAttribute('y1', `${centerPosition.y}`);
				node.line.setAttribute('x2', `${position.x}`);
				node.line.setAttribute('y2', `${position.y}`);
			});

			requestAnimationFrame(frame);
		};

		requestAnimationFrame(frame);
	}

	private measure(node: GraphNode, x: number, y: number): Box {
		return { x, y, width: node.element.offsetWidth, height: node.element.offsetHeight };
	}

	// narrow graphs can not fit the wide labels on the orbits, so overlapping labels are pushed apart and kept inside the graph
	private separate(resting: Box[], center: Box, width: number, height: number) {
		const boxes = resting.map(box => ({ ...box }));

		for (let iteration = 0; iteration < separationIterations; iteration++) {
			let overlapping = false;

			boxes.forEach((box, index) => {
				for (let other of [center, ...boxes.slice(index + 1)]) {
					const deltaX = box.x - other.x;
					const deltaY = box.y - other.y;

					const overlapX = (box.width + other.width) / 2 + separationGap - Math.abs(deltaX);
					const overlapY = (box.height + other.height) / 2 + separationGap - Math.abs(deltaY);

					if (overlapX <= 0 || overlapY <= 0) {
						continue;
					}

					overlapping = true;

					// the center stays in place, two collaborators share the push
					const share = other == center ? 1 : 0.5;

					const pushX = overlapX * share * (Math.sign(deltaX) || 1);
					const pushY = overlapY * share * (Math.sign(deltaY) || 1);

					// push along the axis which needs the smaller move, unless a label would be pushed out of the graph that way
					const horizontalFits = this.fits(box, pushX, 0, width, height) && (other == center || this.fits(other, -pushX, 0, width, height));
					const verticalFits = this.fits(box, 0, pushY, width, height) && (other == center || this.fits(other, 0, -pushY, width, height));

					if (horizontalFits == verticalFits ? overlapX < overlapY : horizontalFits) {
						box.x += pushX;
						other.x -= other == center ? 0 : pushX;
					} else {
						box.y += pushY;
						other.y -= other == center ? 0 : pushY;
					}
				}
			});

			for (let box of boxes) {
				box.x = this.clamp(box.x, box.width / 2 + driftAmplitude, width - box.width / 2 - driftAmplitude);
				box.y = this.clamp(box.y, box.height / 2 + driftAmplitude, height - box.height / 2 - driftAmplitude);
			}

			if (!overlapping) {
				break;
			}
		}

		return boxes;
	}

	// whether the box stays inside the graph after being moved, with a pixel of tolerance for labels resting at the edge
	private fits(box: Box, moveX: number, moveY: number, width: number, height: number) {
		const x = box.x + moveX;
		const y = box.y + moveY;

		return x - box.width / 2 >= driftAmplitude - 1 && x + box.width / 2 <= width - driftAmplitude + 1
			&& y - box.height / 2 >= driftAmplitude - 1 && y + box.height / 2 <= height - driftAmplitude + 1;
	}

	// labels wider than the graph stay centered
	private clamp(value: number, minimum: number, maximum: number) {
		return minimum > maximum ? (minimum + maximum) / 2 : Math.min(Math.max(value, minimum), maximum);
	}

	private place(node: GraphNode, x: number, y: number, time: number, amplitude: number) {
		const seconds = time / 1000 * node.speed;

		x += Math.sin(seconds + node.phase) * amplitude;
		y += Math.cos(seconds * 1.3 + node.phase) * amplitude;

		node.element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;

		return { x, y };
	}
}
