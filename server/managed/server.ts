import { BaseServer, ViewModel, Inject } from "vlserver";

import { ArtistManager } from "././../artist/manager";
import { ArtistViewModel } from "././../artist/model";
import { ArtistService } from "././../artist/service";
import { QuizManager } from "././../quiz/manager";
import { QuizService } from "././../quiz/service";
import { Artist } from "./../managed/database";

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
		parameters: ["DbContext"]
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
			"NhcnlueWY2MGJzYWhuODVtYj5idDJyeG",
			{
			"cyMTBmejkyZnNnM2Fva31pcmRuNGY4cW": { type: "string", isArray: false, isOptional: false },
				"xpMmVtc2JjemR5ZHN4eGVqYT9nOWt5Zm": { type: "string", isArray: false, isOptional: false }
			},
			inject => inject.construct(QuizService),
			(controller, params) => controller.guess(
				params["cyMTBmejkyZnNnM2Fva31pcmRuNGY4cW"],
				params["xpMmVtc2JjemR5ZHN4eGVqYT9nOWt5Zm"]
			)
		);

		this.expose(
			"03d3F3cWNuZWU0eTQyY3NwZzVibHlrdn",
			{
			"pud2ZnNzNhdmI2eGEzMG0wNzJxb3RuNH": { type: "string", isArray: false, isOptional: false },
				"J3YnV5OWsyenluYmpueHdhZWd6dXVzb3": { type: "number", isArray: false, isOptional: false }
			},
			inject => inject.construct(QuizService),
			(controller, params) => controller.getHint(
				params["pud2ZnNzNhdmI2eGEzMG0wNzJxb3RuNH"],
				params["J3YnV5OWsyenluYmpueHdhZWd6dXVzb3"]
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
	}
};