export function QuizHelp(){
 return <details className="quiz-help"><summary>How to play</summary>
  <p>Choose an answer, then select <strong>Check answer</strong>. Each answer earns up to 100 points, multiplied by difficulty. Close answers earn part of the points, and a streak of correct answers adds a bonus. Enter checks the answer and moves to the next question.</p>
  <dl>
   <div><dt>Daily trail</dt><dd>Ten questions that are the same for everyone on that date. Medium difficulty, no timer. Your first run of the day is the one that counts.</dd></div>
   <div><dt>Classic</dt><dd>Ten mixed questions at the difficulty you choose. Turn on the speed bonus to earn extra for fast correct answers.</dd></div>
   <div><dt>Survival</dt><dd>Keep going until you have missed three questions. Difficulty rises after questions 4 and 9.</dd></div>
   <div><dt>Flags, capitals, cities</dt><dd>Four options. Name the country for a flag, pick a country’s capital, or say which country a city is in.</dd></div>
   <div><dt>Head to head / Then vs now</dt><dd>Choose the country with the higher value, or the greater population growth for Then vs now.</dd></div>
   <div><dt>Podiums</dt><dd>Put three places on the podium: highest value in 1st, middle in 2nd, lowest in 3rd. Drag a card, or select it and then select a position. Each pair in the right order earns credit.</dd></div>
   <div><dt>Closest value</dt><dd>Four countries show their values. Pick the one nearest the hidden country. The runner-up still earns some points.</dd></div>
   <div><dt>Guess the gap</dt><dd>Choose the ratio: the first country’s value divided by the second country’s value.</dd></div>
   <div><dt>Odd one out</dt><dd>Choose the country that does not share a land border with the named country.</dd></div>
   <div><dt>Languages</dt><dd>Choose the country with the most people who can speak the language, as a first or second language. Count people, not the share of the population.</dd></div>
   <div><dt>Pin the city</dt><dd>Zoom or pan the map, then tap to place your guess. Dragging pans the map without placing a pin. The closer the pin, the more you score.</dd></div>
   <div><dt>Estimate</dt><dd>Move the slider to your estimate. The closer you are, the more you score.</dd></div>
  </dl>
  <p>Use Tab to move between controls and Enter or Space to select. Arrow keys adjust sliders. To flag a confusing or incorrect question, use <strong>Report this question</strong>.</p>
 </details>;
}
