// plays an attribute bound css animation, restarting it when it is still running
export const playAnimation = (element: Element, attribute: string, duration: number) => {
	element.removeAttribute(attribute);

	// force a reflow, otherwise the browser does not notice the attribute being removed and set again
	element.getBoundingClientRect();

	element.setAttribute(attribute, '');

	clearTimeout((element as any).animationTimeout);
	(element as any).animationTimeout = setTimeout(() => element.removeAttribute(attribute), duration);
};
