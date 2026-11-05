import { Component } from "@acryps/page";
import { CollaborationGraph } from "../quiz/graph";
import { playAnimation } from "../quiz/animation";
import { ArtistService, ArtistViewModel, QuizService } from "../managed/services";

const maximumGuesses = 6;
const searchDelay = 150;
const minimumSearchLength = 2;
const shakeDuration = 400;

type Guess = {
	id: string;
	name: string;
	correct: boolean;

	// collaborated with the solution, added to the graph at the index
	collaborator?: boolean;
	graphIndex?: number;
};

export class HomePage extends Component {
	quizService = new QuizService();
	artistService = new ArtistService();

	day: string;
	collaborators: ArtistViewModel[];
	solution: ArtistViewModel;

	// one entry per character of the solution, null for letters which are not revealed yet
	hint: string[];
	previousHint: string[];

	graph: CollaborationGraph;
	guesses: Guess[] = [];

	input: HTMLInputElement;
	suggestionList: HTMLElement;

	suggestions: ArtistViewModel[] = [];
	selectedSuggestion = 0;
	searchTimeout: number;
	searchQuery: string;

	submitting = false;

	get storageKey() {
		return `collable-${this.day}`;
	}

	get solved() {
		return this.guesses.some(guess => guess.correct);
	}

	get finished() {
		return this.solved || this.guesses.length >= maximumGuesses;
	}

	get wrongGuesses() {
		return this.guesses.filter(guess => !guess.correct).length;
	}

	async onload() {
		this.day = await this.quizService.getDay();
		this.collaborators = await this.quizService.getCollaborators(this.day);

		try {
			this.guesses = JSON.parse(localStorage.getItem(this.storageKey)) ?? [];
		} catch {
			this.guesses = [];
		}

		// the graph is kept across updates, so new collaborators can be animated in
		this.graph = new CollaborationGraph(this.collaborators.map(collaborator => collaborator.name));

		for (let guess of this.guesses) {
			if (guess.collaborator) {
				this.graph.addCollaborator(guess.name, guess.graphIndex, true);
			}
		}

		await this.loadHint();
	}

	// the full name is only requested once the quiz is over, until then the server sends the masked hint
	async loadHint() {
		this.previousHint = this.hint;

		if (this.finished) {
			this.solution = await this.quizService.getSolution(this.day);
			this.hint = [...this.solution.name];
		} else {
			this.hint = await this.quizService.getHint(this.day, this.wrongGuesses);
		}
	}

	render() {
		requestAnimationFrame(() => this.input?.focus());

		if (this.solution) {
			this.graph.reveal(this.solution.name);
		}

		return <ui-home>
			<ui-prompt>
				Who collaborated with all of these artists?
			</ui-prompt>

			{this.graph}

			{this.renderHint()}

			{this.finished ? this.renderResult() : this.renderGuessField()}

			<ui-guesses>
				{Array.from({ length: maximumGuesses }, (_, index) => {
					const guess = this.guesses[index];

					if (!guess) {
						return <ui-guess ui-empty></ui-guess>;
					}

					return <ui-guess ui-correct={guess.correct} ui-collaborator={!!guess.collaborator}>{guess.name}</ui-guess>;
				})}
			</ui-guesses>
		</ui-home>;
	}

	renderHint() {
		// the outline only appears after a few wrong guesses
		if (!this.hint.length) {
			return null;
		}

		const words: Node[][] = [[]];

		this.hint.forEach((character, index) => {
			// spaces separate words, so lines only wrap between words
			if (character == ' ') {
				words.push([]);

				return;
			}

			// letters which were hidden before the last guess pop up
			const revealed = character !== null && this.previousHint?.[index] === null;

			words[words.length - 1].push(<ui-letter ui-hidden={character === null} ui-revealed={revealed}>
				{character ?? ''}
			</ui-letter>);
		});

		return <ui-name-hint ui-solved={this.solved} ui-failed={this.finished && !this.solved}>
			{words.map(letters => <ui-word>{letters}</ui-word>)}
		</ui-name-hint>;
	}

	renderGuessField() {
		this.suggestions = [];

		const field = <ui-guess-field>
			{this.suggestionList = <ui-suggestions></ui-suggestions>}

			<ui-field>
				{this.input = <input placeholder={`Guess the artist (${maximumGuesses - this.guesses.length} left)`} autocomplete="off" spellcheck="false" /> as HTMLInputElement}

				<ui-submit ui-click={() => this.submit(this.suggestions[this.selectedSuggestion])}>
					Guess
				</ui-submit>
			</ui-field>
		</ui-guess-field>;

		this.bindInput();

		return field;
	}

	renderResult() {
		return <ui-result ui-solved={this.solved}>
			<ui-title>
				{this.solved ? `Solved in ${this.guesses.length}/${maximumGuesses}` : `It was ${this.solution.name}`}
			</ui-title>

			<ui-share ui-click={() => this.share()}>
				Share result
			</ui-share>

			<ui-hint>
				A new artist is waiting tomorrow
			</ui-hint>
		</ui-result>;
	}

	// the input is managed manually so typing does not re-render the whole quiz
	bindInput() {
		this.input.oninput = () => {
			clearTimeout(this.searchTimeout);

			this.searchTimeout = setTimeout(() => this.search(), searchDelay);
		};

		this.input.onkeydown = event => {
			if (event.key == 'ArrowDown' || event.key == 'ArrowUp') {
				event.preventDefault();

				if (this.suggestions.length) {
					const offset = event.key == 'ArrowDown' ? 1 : -1;

					this.selectedSuggestion = (this.selectedSuggestion + offset + this.suggestions.length) % this.suggestions.length;
					this.renderSuggestions();
				}
			}

			if (event.key == 'Enter') {
				this.submit(this.suggestions[this.selectedSuggestion]);
			}

			if (event.key == 'Escape') {
				this.suggestions = [];
				this.renderSuggestions();
			}
		};
	}

	async search() {
		const query = this.searchQuery = this.input.value.trim();
		const suggestions = query.length >= minimumSearchLength ? await this.artistService.search(query) : [];

		// ignore responses of outdated queries
		if (query != this.searchQuery) {
			return;
		}

		this.suggestions = suggestions.filter(suggestion => !this.guesses.some(guess => guess.id == suggestion.id));
		this.selectedSuggestion = 0;

		this.renderSuggestions();
	}

	renderSuggestions() {
		this.suggestionList.replaceChildren(...this.suggestions.map((artist, index) => <ui-suggestion
			ui-selected={index == this.selectedSuggestion}
			ui-click={() => this.submit(artist)}
		>
			{artist.name}
		</ui-suggestion>));
	}

	async submit(artist: ArtistViewModel) {
		// only known artists can be guessed, so typos do not waste a guess
		if (!artist) {
			playAnimation(this.input, 'ui-invalid', shakeDuration);

			return;
		}

		// collaborators are visible in the graph already, point them out instead of using up a guess
		const collaborator = this.collaborators.find(collaborator => collaborator.id == artist.id || collaborator.name.toLowerCase() == artist.name.toLowerCase());

		if (collaborator) {
			playAnimation(this.input, 'ui-invalid', shakeDuration);
			this.graph.highlight(collaborator.name);

			this.suggestions = [];
			this.renderSuggestions();

			return;
		}

		if (this.submitting) {
			return;
		}

		this.submitting = true;

		clearTimeout(this.searchTimeout);
		this.searchQuery = null;

		let guess: Guess;

		try {
			const result = await this.quizService.guess(this.day, artist.id);

			guess = {
				id: artist.id,
				name: artist.name,
				correct: result == 'correct',
				collaborator: result == 'collaborator'
			};
		} finally {
			this.submitting = false;
		}

		// half correct guesses join the graph between two random neighbours
		if (guess.collaborator) {
			guess.graphIndex = 1 + Math.floor(Math.random() * this.graph.collaborators.length);

			this.graph.addCollaborator(guess.name, guess.graphIndex, true, true);
		}

		this.guesses.push(guess);

		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.guesses));
		} catch {}

		await this.loadHint();

		this.update();
	}

	async share() {
		const squares = this.guesses.map(guess => guess.correct ? '🟩' : guess.collaborator ? '🟨' : '🟥').join('');
		const text = `Collable ${this.day} ${this.solved ? this.guesses.length : 'X'}/${maximumGuesses}\n${squares}\n${location.origin}`;

		if (navigator.share) {
			try {
				await navigator.share({ text });
			} catch {}

			return;
		}

		await navigator.clipboard.writeText(text);
	}
}
