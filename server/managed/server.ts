import { BaseServer, ViewModel, Inject } from "vlserver";

import { ArtistManager } from "././../artist/manager";
import { ArtistViewModel } from "././../artist/model";
import { ArtistService } from "././../artist/service";
import { QuizManager } from "././../quiz/manager";
import { GuessViewModel } from "././../quiz/model";
import { QuizService } from "././../quiz/service";
import { Artist } from "./../managed/database";
import { Guess } from "./../managed/database";

Inject.mappings = {
	"ArtistService": {
		objectConstructor: ArtistService,
		parameters: ["ArtistManager"]
	},
	"ArtistManager": {
		objectConstructor: ArtistManager,
		parameters: ["DbContext"]
	},
	"QuizService": {
		objectConstructor: QuizService,
		parameters: ["QuizManager"]
	},
	"QuizManager": {
		objectConstructor: QuizManager,
		parameters: ["DbContext","PlayerContext"]
	}
};

export class ManagedServer extends BaseServer {
	prepareRoutes() {
		this.expose(
			"k3bnBuNjpmYmQyNWEzNmUzbDZxNDtxbD",
			{
			"0zdzVxcmJuOD5uY25lMWN3dDc4aW4ydz": { type: "string", isArray: false, isOptional: false }
			},
			inject => inject.construct(ArtistService),
			(controller, params) => controller.search(
				params["0zdzVxcmJuOD5uY25lMWN3dDc4aW4ydz"]
			)
		);

		this.expose(
			"1jcGxlMDVvd21kbG9xeGVpMHUwb2dqMz",
			{},
			inject => inject.construct(QuizService),
			(controller, params) => controller.getDay(
				
			)
		);

		this.expose(
			"F2aD1wY2U2aHlreWRidTo2bWdiNmFnd2",
			{
			"V1ZzhvdGF5dXhraGk1YW5oN2pkYWQ2YW": { type: "string", isArray: false, isOptional: false }
			},
			inject => inject.construct(QuizService),
			(controller, params) => controller.getCollaborators(
				params["V1ZzhvdGF5dXhraGk1YW5oN2pkYWQ2YW"]
			)
		);

		this.expose(
			"kyemZwYjRmdjFqNGI2bHNkc2I5cnVkZ2",
			{
			"ZsMHI3bz1sb2J0MXFxaGZ1YWcybzxwdm": { type: "string", isArray: false, isOptional: false }
			},
			inject => inject.construct(QuizService),
			(controller, params) => controller.getGuesses(
				params["ZsMHI3bz1sb2J0MXFxaGZ1YWcybzxwdm"]
			)
		);

		this.expose(
			"FicmdnZ3B5b3J6eDZubnxyaWN3enRiOX",
			{
			"N0NzUyODU0OXFkb3U3amRud2R6NmFteH": { type: "string", isArray: false, isOptional: false },
				"FidnpkbWVkeTJzbjc0ZzV0NngyODh1MG": { type: "string", isArray: false, isOptional: false }
			},
			inject => inject.construct(QuizService),
			(controller, params) => controller.guess(
				params["N0NzUyODU0OXFkb3U3amRud2R6NmFteH"],
				params["FidnpkbWVkeTJzbjc0ZzV0NngyODh1MG"]
			)
		);

		this.expose(
			"NvdTlsOGVwMm02dGdoMzUxc20xdnhwOX",
			{
			"dpbmF3OHF0MjZtenZ2Z2drc2N5ZHhyYn": { type: "string", isArray: false, isOptional: false }
			},
			inject => inject.construct(QuizService),
			(controller, params) => controller.getHint(
				params["dpbmF3OHF0MjZtenZ2Z2drc2N5ZHhyYn"]
			)
		);

		this.expose(
			"c2dzE2ZWZqdTZrZjpnamtqMD93enU4OW",
			{
			"tuc2Z2dm82YXluNGlhMmd1aWhjc3ZvZD": { type: "string", isArray: false, isOptional: false }
			},
			inject => inject.construct(QuizService),
			(controller, params) => controller.getSolution(
				params["tuc2Z2dm82YXluNGlhMmd1aWhjc3ZvZD"]
			)
		)
	}
}

ViewModel.mappings = {
	[ArtistViewModel.name]: class ComposedArtistViewModel extends ArtistViewModel {
		async map() {
			return {
				id: this.$$model.id,
				name: this.$$model.name
			}
		};

		static get items() {
			return this.getPrefetchingProperties(ViewModel.maximumPrefetchingRecursionDepth, []);
		}

		static getPrefetchingProperties(level: number, parents: string[]) {
			let repeats = false;

			for (let size = 1; size <= parents.length / 2; size++) {
				if (!repeats) {
					for (let index = 0; index < parents.length; index++) {
						if (parents[parents.length - 1 - index] == parents[parents.length - 1 - index - size]) {
							repeats = true;
						}
					}
				}
			}

			if (repeats) {
				level--;
			}

			if (!level) {
				return {};
			}

			return {
				id: true,
				name: true
			};
		};

		static toViewModel(data) {
			const item = new ArtistViewModel(null);
			"id" in data && (item.id = data.id === null ? null : `${data.id}`);
			"name" in data && (item.name = data.name === null ? null : `${data.name}`);

			return item;
		}

		static async toModel(viewModel: ArtistViewModel) {
			let model: Artist;

			if (viewModel.id) {
				model = await ViewModel.globalFetchingContext.findSet(Artist).find(viewModel.id)
			} else {
				model = new Artist();
			}

			"id" in viewModel && (model.id = viewModel.id === null ? null : `${viewModel.id}`);
			"name" in viewModel && (model.name = viewModel.name === null ? null : `${viewModel.name}`);

			return model;
		}
	},
	[GuessViewModel.name]: class ComposedGuessViewModel extends GuessViewModel {
		async map() {
			return {
				artist: new ArtistViewModel(await BaseServer.unwrap(this.$$model.artist)),
				graphIndex: this.$$model.graphIndex,
				id: this.$$model.id,
				result: this.$$model.result
			}
		};

		static get items() {
			return this.getPrefetchingProperties(ViewModel.maximumPrefetchingRecursionDepth, []);
		}

		static getPrefetchingProperties(level: number, parents: string[]) {
			let repeats = false;

			for (let size = 1; size <= parents.length / 2; size++) {
				if (!repeats) {
					for (let index = 0; index < parents.length; index++) {
						if (parents[parents.length - 1 - index] == parents[parents.length - 1 - index - size]) {
							repeats = true;
						}
					}
				}
			}

			if (repeats) {
				level--;
			}

			if (!level) {
				return {};
			}

			return {
				get artist() {
					return ViewModel.mappings[ArtistViewModel.name].getPrefetchingProperties(
						level,
						[...parents, "artist-GuessViewModel"]
					);
				},
				graphIndex: true,
				id: true,
				result: true
			};
		};

		static toViewModel(data) {
			const item = new GuessViewModel(null);
			"artist" in data && (item.artist = data.artist && ViewModel.mappings[ArtistViewModel.name].toViewModel(data.artist));
			"graphIndex" in data && (item.graphIndex = data.graphIndex === null ? null : +data.graphIndex);
			"id" in data && (item.id = data.id === null ? null : `${data.id}`);
			"result" in data && (item.result = data.result === null ? null : `${data.result}`);

			return item;
		}

		static async toModel(viewModel: GuessViewModel) {
			let model: Guess;

			if (viewModel.id) {
				model = await ViewModel.globalFetchingContext.findSet(Guess).find(viewModel.id)
			} else {
				model = new Guess();
			}

			"artist" in viewModel && (model.artist.id = viewModel.artist ? viewModel.artist.id : null);
			"graphIndex" in viewModel && (model.graphIndex = viewModel.graphIndex === null ? null : +viewModel.graphIndex);
			"id" in viewModel && (model.id = viewModel.id === null ? null : `${viewModel.id}`);
			"result" in viewModel && (model.result = viewModel.result === null ? null : `${viewModel.result}`);

			return model;
		}
	}
};