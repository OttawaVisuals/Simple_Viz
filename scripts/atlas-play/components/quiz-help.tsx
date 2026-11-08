export function QuizHelp(){
 return <details className="quiz-help"><summary>How to play</summary>
  <p>There is no timer. Choose an answer, then select <strong>Check answer</strong> to reveal the result and sources.</p>
  <dl>
   <div><dt>Compare / Then vs now</dt><dd>Choose the country with the higher value, or greater population growth for Then vs now.</dd></div>
   <div><dt>Rank / World cities</dt><dd>Put three places on the podium: highest value in 1st, middle in 2nd, lowest in 3rd. Drag a card, or select it and then select a position. Move a placed card onto another to swap them.</dd></div>
   <div><dt>Insert</dt><dd>Choose the gap where the missing country belongs in the ordered list. You can also drag its outline to a gap.</dd></div>
   <div><dt>Guess the gap</dt><dd>Choose the ratio: the first country’s value divided by the second country’s value.</dd></div>
   <div><dt>Odd one out</dt><dd>Choose the country that does not share a land border with the named country.</dd></div>
   <div><dt>Pin the city</dt><dd>Zoom or pan the map, then tap to place your guess. Dragging pans the map without placing a pin. Keyboard controls are listed beside the map.</dd></div>
   <div><dt>Estimate</dt><dd>Move the slider to your estimate. The question states the accepted tolerance.</dd></div>
  </dl>
  <p>Use Tab to move between controls and Enter or Space to select. Arrow keys adjust sliders. To flag a confusing or incorrect question, use <strong>Report this question</strong>.</p>
 </details>;
}
