import { Component } from "@acryps/page";
import { maximumGuesses } from "../home";

export class HelpPage extends Component {
	render() {
		return <ui-help>
			<ui-prompt>
				How to play
			</ui-prompt>

			<ui-section>
				<ui-title>Find the artist</ui-title>

				<ui-text>
					Every day there is a new mystery artist in the middle of the graph.
					Around them are the artists they collaborated with the most.
					Figure out who connects all of them.
				</ui-text>
			</ui-section>

			<ui-section>
				<ui-title>Guess</ui-title>

				<ui-text>
					Type an artist and pick them from the suggestions, you have {maximumGuesses} guesses.
					Artists already shown in the graph do not count as a guess.
				</ui-text>

				<ui-results>
					<ui-result ui-correct>
						<ui-name>Correct</ui-name>
						<ui-text>The mystery artist, you solved it.</ui-text>
					</ui-result>

					<ui-result ui-collaborator>
						<ui-name>Collaborator</ui-name>
						<ui-text>Not the artist, but they worked together. The guess joins the graph.</ui-text>
					</ui-result>

					<ui-result>
						<ui-name>Wrong</ui-name>
						<ui-text>No collaboration with the mystery artist.</ui-text>
					</ui-result>
				</ui-results>
			</ui-section>

			<ui-section>
				<ui-title>Hints</ui-title>

				<ui-text>
					After your first miss the outline of the name appears.
					Every further miss reveals more letters, but never the whole name.
				</ui-text>
			</ui-section>

			<ui-section>
				<ui-title>Every day</ui-title>

				<ui-text>
					A new artist is picked at midnight UTC.
					Missed a day? Play it in the <ui-link ui-href='/archive'>archive</ui-link>.
				</ui-text>
			</ui-section>

			<ui-play ui-href='/'>
				Play today
			</ui-play>
		</ui-help>;
	}
}
