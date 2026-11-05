export class ArtistViewModel {
	id: string;
	name: string;

	private static $build(raw) {
		const item = new ArtistViewModel();
		raw.id === undefined || (item.id = raw.id === null ? null : `${raw.id}`)
		raw.name === undefined || (item.name = raw.name === null ? null : `${raw.name}`)
		
		return item;
	}
}

export class Service {
	static baseUrl = "";

	static toURL(request) {
		return `${this.baseUrl}${request}`;
	}
	
	static stringify(object) {
		if (Array.isArray(object)) {
			return '[' + object.map(item => this.stringify(item)).join(',') + ']';
		}
	
		return JSON.stringify(object, (key, value) => {
			if (value instanceof Date) {
				return value.toISOString();
			}
			
			if (value === null) {
				return null;
			}
			
			if (typeof value === 'object' && key !== '') {
				if (value && 'id' in value) {
					return {
						id: value.id
					};
				}
			
				return undefined;
			}
			
			return value;
		});
	}
}

export class ArtistService {
	async search(query: string): Promise<Array<ArtistViewModel>> {
		const $data = new FormData();
		$data.append("0zdzVxcmJuOD5uY25lMWN3dDc4aW4ydz", Service.stringify(query))

		return await fetch(Service.toURL("k3bnBuNjpmYmQyNWEzNmUzbDZxNDtxbD"), {
			method: "post",
			credentials: "include",
			body: $data
		}).then(res => res.json()).then(r => {
			if ("data" in r) {
				const d = r.data;

				return d.map(d => d === null ? null : ArtistViewModel["$build"](d));
			} else if ("aborted" in r) {
				throw new Error("request aborted by server");
			} else if ("error" in r) {
				throw new Error(r.error);
			}
		});
	}
}

export class QuizService {
	async getDay(): Promise<string> {
		const $data = new FormData();
		

		return await fetch(Service.toURL("1jcGxlMDVvd21kbG9xeGVpMHUwb2dqMz"), {
			method: "post",
			credentials: "include",
			body: $data
		}).then(res => res.json()).then(r => {
			if ("data" in r) {
				const d = r.data;

				return d === null ? null : `${d}`;
			} else if ("aborted" in r) {
				throw new Error("request aborted by server");
			} else if ("error" in r) {
				throw new Error(r.error);
			}
		});
	}

	async getCollaborators(day: string): Promise<Array<ArtistViewModel>> {
		const $data = new FormData();
		$data.append("V1ZzhvdGF5dXhraGk1YW5oN2pkYWQ2YW", Service.stringify(day))

		return await fetch(Service.toURL("F2aD1wY2U2aHlreWRidTo2bWdiNmFnd2"), {
			method: "post",
			credentials: "include",
			body: $data
		}).then(res => res.json()).then(r => {
			if ("data" in r) {
				const d = r.data;

				return d.map(d => d === null ? null : ArtistViewModel["$build"](d));
			} else if ("aborted" in r) {
				throw new Error("request aborted by server");
			} else if ("error" in r) {
				throw new Error(r.error);
			}
		});
	}

	async guess(day: string, artistId: string): Promise<string> {
		const $data = new FormData();
		$data.append("cyMTBmejkyZnNnM2Fva31pcmRuNGY4cW", Service.stringify(day))
		$data.append("xpMmVtc2JjemR5ZHN4eGVqYT9nOWt5Zm", Service.stringify(artistId))

		return await fetch(Service.toURL("NhcnlueWY2MGJzYWhuODVtYj5idDJyeG"), {
			method: "post",
			credentials: "include",
			body: $data
		}).then(res => res.json()).then(r => {
			if ("data" in r) {
				const d = r.data;

				return d === null ? null : `${d}`;
			} else if ("aborted" in r) {
				throw new Error("request aborted by server");
			} else if ("error" in r) {
				throw new Error(r.error);
			}
		});
	}

	async getHint(day: string, wrongGuesses: number): Promise<Array<string>> {
		const $data = new FormData();
		$data.append("pud2ZnNzNhdmI2eGEzMG0wNzJxb3RuNH", Service.stringify(day))
		$data.append("J3YnV5OWsyenluYmpueHdhZWd6dXVzb3", Service.stringify(wrongGuesses))

		return await fetch(Service.toURL("03d3F3cWNuZWU0eTQyY3NwZzVibHlrdn"), {
			method: "post",
			credentials: "include",
			body: $data
		}).then(res => res.json()).then(r => {
			if ("data" in r) {
				const d = r.data;

				return d.map(d => d === null ? null : `${d}`);
			} else if ("aborted" in r) {
				throw new Error("request aborted by server");
			} else if ("error" in r) {
				throw new Error(r.error);
			}
		});
	}

	async getSolution(day: string): Promise<ArtistViewModel> {
		const $data = new FormData();
		$data.append("tuc2Z2dm82YXluNGlhMmd1aWhjc3ZvZD", Service.stringify(day))

		return await fetch(Service.toURL("c2dzE2ZWZqdTZrZjpnamtqMD93enU4OW"), {
			method: "post",
			credentials: "include",
			body: $data
		}).then(res => res.json()).then(r => {
			if ("data" in r) {
				const d = r.data;

				return d === null ? null : ArtistViewModel["$build"](d);
			} else if ("aborted" in r) {
				throw new Error("request aborted by server");
			} else if ("error" in r) {
				throw new Error(r.error);
			}
		});
	}
}