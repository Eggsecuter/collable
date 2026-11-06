import { Component } from "@acryps/page";
import { checkIcon, clockIcon, leftIcon, rightIcon, searchIcon, shareIcon } from "../.built/icons";
import { ArtistService, ArtistViewModel, CollaboratorViewModel, GuessViewModel, QuizService } from "../managed/services";
import { playAnimation } from "../quiz/animation";
import { formatDay, toDay } from "../quiz/day";
import { CollaborationGraph } from "../quiz/graph";
import { resultIcon } from "../quiz/result";

export const maximumGuesses = 6;
const searchDelay = 150;
const minimumSearchLength = 2;
const shakeDuration = 400;
const copiedDuration = 2000;

type Guess = {
	id: string;
	name: string;
	correct: boolean;

	// collaborated with the solution, added to the graph at the index
	collaborator?: boolean;
	graphIndex?: number;
	collaborationCount?: number;
};

// plays today, or a previous day when opened from the archive
export class HomePage extends Component {
	declare parameters: { day?: string };

	quizService = new QuizService();
	artistService = new ArtistService();

	today: string;
	day: string;
	archived: boolean;

	// neighbouring days of an archived day, the next day of yesterday is today
	previousDay: string;
	nextDay: string;

	collaborators: CollaboratorViewModel[];
	solution: ArtistViewModel;

	// one entry per character of the solution, null for letters which are not revealed yet
	hint: string[];
	previousHint: string[];

	graph: CollaborationGraph;
	guesses: Guess[] = [];

	input: HTMLInputElement;
	inputBox: HTMLElement;
	suggestionList: HTMLElement;

	suggestions: ArtistViewModel[] = [];
	selectedSuggestion = 0;
	searchTimeout: number;
	searchQuery: string;

	submitting = false;

	shareButton: HTMLElement;
	copiedTimeout: number;

	get solved() {
		return this.guesses.some(guess => guess.correct);
	}

	get finished() {
		return this.solved || this.guesses.length >= maximumGuesses;
	}

	async onload() {
		this.today = await this.quizService.getDay();

		this.day = this.parameters?.day ?? this.today;
		this.archived = this.day != this.today;

		if (this.archived) {
			// the days are sorted from newest to oldest
			const days = (await this.quizService.getArchiveDays()).map(dailyArtist => toDay(dailyArtist.day));
			const index = days.indexOf(this.day);

			this.previousDay = days[index + 1];
			this.nextDay = days[index - 1];
		}

		this.collaborators = await this.quizService.getCollaborators(this.day);

		// the guesses are stored on the server, identified by the player cookie
		this.guesses = (await this.quizService.getGuesses(this.day)).map(guess => this.toGuess(guess));

		// the graph is kept across updates, so new collaborators can be animated in
		this.graph = new CollaborationGraph(this.collaborators.map(collaborator => ({ name: collaborator.artist.name, count: collaborator.count })));

		for (let guess of this.guesses) {
			if (guess.collaborator) {
				this.graph.addCollaborator(guess.name, guess.collaborationCount, guess.graphIndex, true);
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
			this.hint = await this.quizService.getHint(this.day);
		}
	}

	render() {
		requestAnimationFrame(() => this.input?.focus());

		if (this.solution) {
			this.graph.reveal(this.solution.name);
		}

		return <ui-home>
			<ui-prompt>
				{this.archived ? this.renderDate() : null}

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

					return <ui-guess ui-correct={guess.correct} ui-collaborator={!!guess.collaborator}>
						{resultIcon(guess.correct ? 'correct' : guess.collaborator ? 'collaborator' : 'wrong')}

						<ui-name>{guess.name}</ui-name>
					</ui-guess>;
				})}
			</ui-guesses>
		</ui-home>;
	}

	// the arrows keep their place on the first day, so the date does not shift
	renderDate() {
		return <ui-date>
			{this.previousDay ? <ui-step ui-href={`/day/${this.previousDay}`}>
				{leftIcon()}
			</ui-step> : <ui-step ui-disabled>
				{leftIcon()}
			</ui-step>}

			{formatDay(this.day)}

			<ui-step ui-href={this.nextDay == this.today ? '/' : `/day/${this.nextDay}`}>
				{rightIcon()}
			</ui-step>
		</ui-date>;
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
				{this.inputBox = <ui-input>
					{searchIcon()}

					{this.input = <input placeholder={`Guess the artist (${maximumGuesses - this.guesses.length} left)`} autocomplete="off" spellcheck="false" /> as HTMLInputElement}
				</ui-input>}

				<ui-submit ui-click={() => this.submit(this.suggestions[this.selectedSuggestion])}>
					Guess
					{rightIcon()}
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

			{this.shareButton = <ui-share ui-click={() => this.share()}>
				{shareIcon()}
				Share result
			</ui-share>}

			<ui-hint>
				{clockIcon()}

				{this.archived ? 'Play another day from the ' : 'A new artist is waiting tomorrow, until then play previous days in the '}
				<ui-link ui-href='/archive'>archive</ui-link>
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
			playAnimation(this.inputBox, 'ui-invalid', shakeDuration);

			return;
		}

		// collaborators are visible in the graph already, point them out instead of using up a guess
		const collaborator = this.collaborators.map(collaborator => collaborator.artist).find(collaborator => collaborator.id == artist.id || collaborator.name.toLowerCase() == artist.name.toLowerCase());

		if (collaborator) {
			playAnimation(this.inputBox, 'ui-invalid', shakeDuration);
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
			guess = this.toGuess(await this.quizService.guess(this.day, artist.id));
		} finally {
			this.submitting = false;
		}

		// half correct guesses join the graph at the position chosen by the server
		if (guess.collaborator) {
			this.graph.addCollaborator(guess.name, guess.collaborationCount, guess.graphIndex, true, true);
		}

		this.guesses.push(guess);

		await this.loadHint();

		this.update();
	}

	toGuess(guess: GuessViewModel): Guess {
		return {
			id: guess.artist.id,
			name: guess.artist.name,
			correct: guess.result == 'correct',
			collaborator: guess.result == 'collaborator',
			graphIndex: guess.graphIndex,
			collaborationCount: guess.collaborationCount
		};
	}

	async share() {
		const squares = this.guesses.map(guess => guess.correct ? '🟩' : guess.collaborator ? '🟨' : '🟥').join('');
		const link = this.archived ? `${location.origin}/day/${this.day}` : location.origin;
		const text = `Collable ${this.day} ${this.solved ? this.guesses.length : 'X'}/${maximumGuesses}\n${squares}\n${link}`;

		if (navigator.share) {
			try {
				await navigator.share({ text });
			} catch {}

			return;
		}

		await navigator.clipboard.writeText(text);

		// copying happens silently, the button confirms it for a moment
		this.shareButton.replaceChildren(checkIcon(), 'Copied');

		clearTimeout(this.copiedTimeout);
		this.copiedTimeout = setTimeout(() => this.shareButton.replaceChildren(shareIcon(), 'Share result'), copiedDuration);
	}
}
