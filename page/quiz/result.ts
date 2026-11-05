import { checkIcon, closeIcon, linkIcon } from "../.built/icons";

// the icon next to the color, so results can be told apart without seeing colors
export const resultIcon = (result: 'correct' | 'collaborator' | 'wrong') => {
	if (result == 'correct') {
		return checkIcon();
	}

	if (result == 'collaborator') {
		return linkIcon();
	}

	return closeIcon();
};
