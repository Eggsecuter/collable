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

// the loop keeps running while the graph is moved between renders, only stop once it is gone for good
const detachedFramesLimit = 60;

type GraphNode = {
	name: string;

	element: HTMLElement;
	line?: SVGLineElement;

	// current layout, eased towards the target layout of the nodes index
	angle: number;
	radius: number;

	phase: number;
	speed: number;
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

			previousTime = time;

			const width = this.element.clientWidth;
			const height = this.element.clientHeight;

			const centerPosition = this.place(this.center, width / 2, height / 2, time, reducedMotion ? 0 : driftAmplitude / 2);

			this.collaborators.forEach((node, index) => {
				node.angle += (this.targetAngle(index) - node.angle) * easing;
				node.radius += (this.targetRadius(index) - node.radius) * easing;

				const position = this.place(
					node,
					width / 2 + Math.cos(node.angle) * width / 2 * node.radius,
					height / 2 + Math.sin(node.angle) * height / 2 * node.radius,
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

	private place(node: GraphNode, x: number, y: number, time: number, amplitude: number) {
		const seconds = time / 1000 * node.speed;

		x += Math.sin(seconds + node.phase) * amplitude;
		y += Math.cos(seconds * 1.3 + node.phase) * amplitude;

		node.element.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;

		return { x, y };
	}
}
