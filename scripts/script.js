import { MatchThree } from "./match-three.js";

let matchThreeInstance;

function startGame() {
  const isMobile = window.innerWidth <= 480;
  
  const rows = isMobile ? 6 : 5;
  const columns = isMobile ? 5 : 6;

  matchThreeInstance = new MatchThree(rows,columns , 4);
}


startGame();

window.addEventListener("beforeunload", () => {
	const points = matchThreeInstance?.game?.totalRemovedTargetTile ?? 0;

	console.log({
		type: "exit",
		points: points * 10,
	});
});
