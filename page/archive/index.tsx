import { Component } from "@acryps/page";
import { ArchiveDayViewModel, ArchiveGuessViewModel, QuizService } from "../managed/services";
import { formatDay, toDay } from "../quiz/day";
import { maximumGuesses } from "../home";
import { resultIcon } from "../quiz/result";

export class ArchivePage extends Component {
	quizService = new QuizService();

	today: string;
	days: ArchiveDayViewModel[];
	guesses: ArchiveGuessViewModel[];

	async onload() {
		this.today = await this.quizService.getDay();
		this.days = await this.quizService.getArchiveDays();

		// the guesses of the player, identified by the cookie
		this.guesses = await this.quizService.getArchiveGuesses();
	}

	render() {
		return <ui-archive>
			<ui-prompt>
				Play the artists of previous days
			</ui-prompt>

			<ui-days>
				{this.days.map(dailyArtist => this.renderDay(dailyArtist))}
			</ui-days>
		</ui-archive>;
	}

	renderDay(dailyArtist: ArchiveDayViewModel) {
		const day = toDay(dailyArtist.day);
		const guesses = this.guesses.filter(guess => guess.dailyArtistId == dailyArtist.id);

		const solved = guesses.some(guess => guess.result == 'correct');
		const finished = solved || guesses.length >= maximumGuesses;

		let status = 'Not played';

		if (solved) {
			status = `Solved in ${guesses.length}/${maximumGuesses}`;
		} else if (finished) {
			status = 'Missed';
		} else if (guesses.length) {
			status = `${maximumGuesses - guesses.length} guesses left`;
		}

		// today is played on the home page, so it does not show up twice
		return <ui-day ui-href={day == this.today ? '/' : `/day/${day}`} ui-solved={solved} ui-failed={finished && !solved}>
			<ui-date>
				{day == this.today ? 'Today' : formatDay(day)}
			</ui-date>

			<ui-results>
				{guesses.map(guess => <ui-result ui-correct={guess.result == 'correct'} ui-collaborator={guess.result == 'collaborator'}>
					{resultIcon(guess.result as 'correct' | 'collaborator' | 'wrong')}
				</ui-result>)}
			</ui-results>

			<ui-status>
				{status}
			</ui-status>
		</ui-day>;
	}
}
