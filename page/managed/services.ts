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

export class GuessViewModel {
	artist: ArtistViewModel;
	graphIndex: number;
	id: string;
	result: string;

	private static $build(raw) {
		const item = new GuessViewModel();
		raw.artist === undefined || (item.artist = raw.artist ? ArtistViewModel["$build"](raw.artist) : null)
		raw.graphIndex === undefined || (item.graphIndex = raw.graphIndex === null ? null : +raw.graphIndex)
		raw.id === undefined || (item.id = raw.id === null ? null : `${raw.id}`)
		raw.result === undefined || (item.result = raw.result === null ? null : `${raw.result}`)
		
		return item;
	}
}

export class ArchiveDayViewModel {
	day: Date;
	id: string;

	private static $build(raw) {
		const item = new ArchiveDayViewModel();
		raw.day === undefined || (item.day = raw.day ? new Date(raw.day) : null)
		raw.id === undefined || (item.id = raw.id === null ? null : `${raw.id}`)
		
		return item;
	}
}

export class ArchiveGuessViewModel {
	dailyArtistId: string;
	id: string;
	result: string;

	private static $build(raw) {
		const item = new ArchiveGuessViewModel();
		raw.dailyArtistId === undefined || (item.dailyArtistId = raw.dailyArtistId === null ? null : `${raw.dailyArtistId}`)
		raw.id === undefined || (item.id = raw.id === null ? null : `${raw.id}`)
		raw.result === undefined || (item.result = raw.result === null ? null : `${raw.result}`)
		
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

	async getArchiveDays(): Promise<Array<ArchiveDayViewModel>> {
		const $data = new FormData();
		

		return await fetch(Service.toURL("JmaWJuZjl4eXdvNmMyNHlkYXFqMXVpN2"), {
			method: "post",
			credentials: "include",
			body: $data
		}).then(res => res.json()).then(r => {
			if ("data" in r) {
				const d = r.data;

				return d.map(d => d === null ? null : ArchiveDayViewModel["$build"](d));
			} else if ("aborted" in r) {
				throw new Error("request aborted by server");
			} else if ("error" in r) {
				throw new Error(r.error);
			}
		});
	}

	async getArchiveGuesses(): Promise<Array<ArchiveGuessViewModel>> {
		const $data = new FormData();
		

		return await fetch(Service.toURL("gzNzhyaH14c2RibTowcmRxeHY5ZWIzNG"), {
			method: "post",
			credentials: "include",
			body: $data
		}).then(res => res.json()).then(r => {
			if ("data" in r) {
				const d = r.data;

				return d.map(d => d === null ? null : ArchiveGuessViewModel["$build"](d));
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

	async getGuesses(day: string): Promise<Array<GuessViewModel>> {
		const $data = new FormData();
		$data.append("ZsMHI3bz1sb2J0MXFxaGZ1YWcybzxwdm", Service.stringify(day))

		return await fetch(Service.toURL("kyemZwYjRmdjFqNGI2bHNkc2I5cnVkZ2"), {
			method: "post",
			credentials: "include",
			body: $data
		}).then(res => res.json()).then(r => {
			if ("data" in r) {
				const d = r.data;

				return d.map(d => d === null ? null : GuessViewModel["$build"](d));
			} else if ("aborted" in r) {
				throw new Error("request aborted by server");
			} else if ("error" in r) {
				throw new Error(r.error);
			}
		});
	}

	async guess(day: string, artistId: string): Promise<GuessViewModel> {
		const $data = new FormData();
		$data.append("N0NzUyODU0OXFkb3U3amRud2R6NmFteH", Service.stringify(day))
		$data.append("FidnpkbWVkeTJzbjc0ZzV0NngyODh1MG", Service.stringify(artistId))

		return await fetch(Service.toURL("FicmdnZ3B5b3J6eDZubnxyaWN3enRiOX"), {
			method: "post",
			credentials: "include",
			body: $data
		}).then(res => res.json()).then(r => {
			if ("data" in r) {
				const d = r.data;

				return d === null ? null : GuessViewModel["$build"](d);
			} else if ("aborted" in r) {
				throw new Error("request aborted by server");
			} else if ("error" in r) {
				throw new Error(r.error);
			}
		});
	}

	async getHint(day: string): Promise<Array<string>> {
		const $data = new FormData();
		$data.append("dpbmF3OHF0MjZtenZ2Z2drc2N5ZHhyYn", Service.stringify(day))

		return await fetch(Service.toURL("NvdTlsOGVwMm02dGdoMzUxc20xdnhwOX"), {
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