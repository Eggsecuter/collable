import { randomUUID } from "crypto";

const playerCookieName = 'collable-player';

// renewed on every visit, so only players inactive for a year lose their guesses
const playerCookieMaxAge = 1000 * 60 * 60 * 24 * 365;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// anonymous players are identified by a random uuid in a cookie, there are no accounts
export class PlayerContext {
	constructor(
		public id: string
	) {}
}

// gives new players an id, the cookie is sent along with every request afterwards
// invalid ids are replaced, they would fail as an uuid in the database
export const assignPlayer = (request, response, next) => {
	let id = request.cookies[playerCookieName];

	if (!uuidPattern.test(id ?? '')) {
		id = randomUUID();
	}

	// the page is the first request of a visit, refresh the expiry there instead of on every service call
	if (id != request.cookies[playerCookieName] || request.method == 'GET') {
		response.cookie(playerCookieName, id, {
			maxAge: playerCookieMaxAge,
			httpOnly: true,
			sameSite: 'lax',
			secure: request.secure
		});
	}

	response.locals.playerId = id;

	next();
};
